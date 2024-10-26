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
	id: string,
	type: string,
	description: string,
	image: string,
	link: Link,
	maxplayers: number,
	maxplaytime: number,
	minage: number,
	minplayers: number,
	minplaytime: number,
	name: string,
	numplays: number,
	playingtime: number,
	poll: Poll[],
	statistics: Statistics,
	yearpublished: string
}

interface ValueObject {
	'@_id': ?string,
	'@_type': ?string,
	'@_value': string
}

interface Statistics {
	average: string,
	averageweight: string,
	bayesaverage: string,
	median: string,
	numcomments: string,
	numweights: string,
	owned: string,
	stddev: string,
	trading: string,
	usersrated: string,
	wanting: string,
	wishing: string,
}

interface Link {
	boardgameaccessory: Array,
	boardgameartist: Array,
	boardgamecategory: Array,
	boardgamecompilation: Array,
	boardgamedesigner: Array,
	boardgameexpansion: Array,
	boardgamefamily: Array,
	boardgameimplementation: Array,
	boardgamemechanic: Array,
	boardgamepublisher: Array,
}

interface Poll {
	'@_name': string,
	'@_title': string,
	'@_totalvotes': string
	results: Array
}
