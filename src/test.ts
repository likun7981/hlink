import chalk from 'chalk';

// @ts-ignore
import wrapAnsi from 'wrap-ansi';

const input = 'The quick brownbro w n b r ownbrownbrownbrow nbrownbrownbrown brownbrownbrownbrown ' + chalk.red('fox jumped over ') +
	'the lazy ' + chalk.green('dog and then ran away with the unicorn.');

console.log(wrapAnsi(input, 40));
