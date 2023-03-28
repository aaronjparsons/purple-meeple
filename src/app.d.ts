// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

interface Game {
	'@_id': string,
	'@_type': string,
	description: string,
	image: string,
	link: ValueObject[],
	maxplayers: ValueObject,
	maxplaytime: ValueObject,
	minage: ValueObject,
	minplayers: ValueObject,
	minplaytime: ValueObject,
	name: ValueObject[],
	playingtime: ValueObject,
	poll: Poll[],
	statistics: Statistics,
	yearpublished: ValueObject
}

interface ValueObject {
	'@_id': ?string,
	'@_type': ?string,
	'@_value': string
}

interface Statistics {
	'@_page': string,
	ratings: Ratings
}

interface Poll {
	'@_name': string,
	'@_title': string,
	'@_totalVotes': string
	results: Array
}

interface Ratings {
	average: ValueObject,
	averageweight: ValueObject,
	bayesaverage: ValueObject,
	median: ValueObject,
	numcomments: ValueObject,
	numweights: ValueObject,
	owned: ValueObject,
	ranks: ValueObject[],
	stddev: ValueObject,
	trading: ValueObject,
	usersrated: ValueObject,
	wanting: ValueObject,
	wishing: ValueObject
}
