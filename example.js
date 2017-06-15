const CuckooDb = require('./index');
const cuckoodb = new CuckooDb(
	process.env.CUCKOODB_BUCKET,
	process.env.CUCKOODB_KEY,
	process.env.CUCKOODB_CRYPTOKEY
);

cuckoodb.keys()
.then(keys => {
	console.log('Keys1:', keys)
})
.then(() => cuckoodb.set('seagulls', 'follow the trawler'))
.then(() => cuckoodb.set('sardines', 'will be thrown into the sea'))
.then(() => cuckoodb.keys())
.then(keys => {
	console.log('Keys2:', keys);
})
.then(() => cuckoodb.get('seagulls'))
.then(data => {
	console.log(data);
})
.then(() => cuckoodb.get('sardines'))
.then(data => {
	console.log(data);
})
.catch(err => {
	console.log('Err keys:', Object.keys(err));
	console.dir('Dir err:', err);
	console.log('Log err:', err);
});
