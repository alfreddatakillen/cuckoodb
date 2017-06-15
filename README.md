CuckooDb
========

This is a key-value store, using an encrypted JSON blob on AWS S3 as
persistent storage.

Features
--------

* All data is encrypted before sent to AWS S3.
* Can store any value that can be stringified with JSON.
* Promise interface.
* No concurrency control, nothing fancy. Don't use this when you
  have multiple processes writing critical data simultaneously. Also,
  performance is horrible for large data sets. This was built for storing
  configurations (i.e. small datasets that does not update very often).

Usage
-----

```
const CuckooDb = require('cuckoodb');
const cuckoodb = new CuckooDb(bucket, s3Key, cryptoKey);

// ----------------------
// To set a value:
// ----------------------

cuckoodb.set('footballplayer', 'zlatan')
.then(() => {
	console.log('success!');
})
.catch(err => {
	console.log('failure :(');
	console.log(err);
});

// ----------------------
// To get a value:
// ----------------------

cuckoodb.get('footballplayer')
.then(value => {
	if (typeof value === 'undefined') {
		console.log('Nothing stored for this key.');
	} else {
		console.log('Value:', value);
	}
})
.catch(err => {
	console.log('Some error occured.');
	console.log(err);
});

// ------------------------------------------------
// To get a list of all keys in the database:
// ------------------------------------------------

cuckoodb.keys()
.then(keys => {
	// keys is an array of strings.
	// For example: [ 'footballplayer' ]
	console.log('Keys in db:', keys);
})
.catch(err => {
	console.log('There was an error.');
	console.log(err);
});
```

Errors
------

### `SyntaxError: Unexpected token in JSON at position 0`

This probably means that you have changed encryption key. Data on AWS S3 is
stored using one encryption key, but when decrypted with another key, the data
is not valid JSON anymore.

TODO/Road map/Wish list
-----------------------

* Some caching to avoid getting data from AWS S3 too often.
  A couple of seconds as default cache timeout?
 
