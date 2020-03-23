# Storybook Extractor

This tiny CLI package uses puppeteer to get the list of stories of a deployed storybook.

## Usage:

```sh
extract-storybook <location> <output>
```

Location:
where your storybook is deployed. - *default = "./static-storybook"*

Output:
where you want the json to be saved to. - *default = "./static-storybook/stories.json"*
