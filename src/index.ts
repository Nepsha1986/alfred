#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from "inquirer";

import PostCreator from "./modules/post-creator";

const modulesMap = new Map([
	['Create new post', PostCreator],
]);

interface Answers {
	helper: string;
}

const run = async () => {
	const questions = [
		{
			name: 'helper',
			type: 'list',
			message: chalk.green('Please choose what you want me to do'),
			choices: Array.from(modulesMap.keys())
		}
	];

	// @ts-ignore
	let answers: Answers = await inquirer.prompt(questions);
	const selectedAction = modulesMap.get(answers.helper);
	if (selectedAction) {
		selectedAction();
	} else {
		console.error('No action found for the selected choice.');
	}
};

void run();
