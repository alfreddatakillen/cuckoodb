const Promise = require('bluebird');
const Mutex = require('promise-mutex');
const mutex = new Mutex();

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);

const s3 = new AWS.S3();

const crypto = require('crypto')
const algorithm = 'aes-256-ctr';

function decrypt(data, cryptokey) {
	const decipher = crypto.createDecipher(algorithm, cryptokey)
	return Buffer.concat([ decipher.update(data), decipher.final() ]);
}

function encrypt(data, cryptokey) {
	const cipher = crypto.createCipher(algorithm, cryptokey)
	return Buffer.concat([ cipher.update(data), cipher.final() ]);
}

function fetch(bucket, key, cryptokey) {
	return s3.getObject({
		Bucket: bucket,
		Key: key
	}).promise()
	.then(data => JSON.parse(decrypt(data.Body, cryptokey)))
	.catch(err => {
		if (err.code === 'NoSuchKey') {
			// Key does not exist. Start with clean sheets.
			return {};
		}

		throw err;
	})
}

function store(data, bucket, key, cryptokey) {
	return Promise.try(() => {
		return encrypt(JSON.stringify(data), cryptokey);
	})
	.then(data => s3.putObject({ Bucket: bucket, Key: key, Body: data }).promise())
	.then(data => {
		console.log('Stored:', data);
	});
}

class CuckooDb {

	constructor(bucket, key, cryptokey) {
		this.bucket = bucket;
		this.key = key;
		this.cryptokey = cryptokey;
	}

	get(key) {
		return mutex.lock(() => {
			return fetch(this.bucket, this.key, this.cryptokey)
			.then(data => {
				return data[key];
			})
		});
	}

	keys() {
		return mutex.lock(() => {
			return fetch(this.bucket, this.key, this.cryptokey)
			.then(data => {
				return Object.keys(data);
			})
		});
	}

	set(key, value) {
		return mutex.lock(() => {
			return fetch(this.bucket, this.key, this.cryptokey)
			.then(data => {
				if (JSON.stringify(data[key]) !== JSON.stringify(value)) {
					data[key] = value;
					return store(data, this.bucket, this.key, this.cryptokey);
				}
			})
		});
	}

}

module.exports = CuckooDb;
