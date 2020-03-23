import path from 'path';
import { writeFile } from 'fs-extra';
import express from 'express';
import getPort from 'get-port';
import puppeteer from 'puppeteer';

const read = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForFunction(
    'window.__STORYBOOK_STORY_STORE__ && window.__STORYBOOK_STORY_STORE__.extract && window.__STORYBOOK_STORY_STORE__.extract()'
  );
  const data = JSON.parse(
    await page.evaluate(async () => {
      /* eslint-disable no-undef */
      // @ts-ignore
      const d = window.__STORYBOOK_STORY_STORE__.extract() as Record<string, any>;

      const result = Object.entries(d).reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: {
            ...v,
            parameters: {
              globalArgs: v.parameters.globalArgs,
              globalArgTypes: v.parameters.globalArgTypes,
              options: v.parameters.options,
              args: v.parameters.args,
              argTypes: v.parameters.argTypes,
              framework: v.parameters.framework,
              fileName: v.parameters.fileName,
              docsOnly: v.parameters.docsOnly,
            },
          },
        }),
        {}
      );
      return JSON.stringify(result, null, 2);
      /* eslint-enable no-undef */
    })
  );

  setImmediate(() => {
    browser.close();
  });
  return data;
};

const useLocation = async (input: string): Promise<[string, Function]> => {
  if (input.match(/^http/)) {
    return [input, async () => {}];
  }

  const app = express();

  app.use(express.static(input));

  const port = await getPort();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, e => {
      if (e) {
        reject(e);
      }

      const result = `http://localhost:${port}/iframe.html`;

      console.log(`connecting to: ${result}`);

      resolve([result, server.close.bind(server)]);
    });
  });
};

export async function extract(
  input = 'storybook-static',
  targetPath: string = path.join(input, 'stories.json')
) {
  if (input && targetPath) {
    const [location, exit] = await useLocation(input);

    const stories = await read(location);

    await writeFile(targetPath, JSON.stringify({ stories }, null, 2));

    await exit();
  } else {
    throw new Error(
      'Extract: please specify a path where your built-storybook is (can be a public url) and a target directory'
    );
  }
}
