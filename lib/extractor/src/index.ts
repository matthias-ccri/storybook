import meow from 'meow';

import { extract } from './extract';

const cli = meow(
  `
	Usage
	  $ extract-storybook <location> <target>

	Examples
	  $ extract-storybook https://storybookjs.netlify.com/official-storybook/ ./stories.json
  `,
  {}
);

extract(cli.input[0], cli.input[1]);
