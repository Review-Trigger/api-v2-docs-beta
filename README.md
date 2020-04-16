# Review Trigger API docs

## apidoc Install
You can add apidoc to your local machine simple using npm:

`npm install -g apidoc`

After this you should be able to run `apidoc` command inside Review Trigger repo, in order to generate docs:

## Running apidoc

You can run it simply by typing following command on command line, once inside Review Trigger project:

` apidoc -i app/controllers/api/...path to your controllers/ -o ../api-v2-docs-beta/...subfolder.../  -t ../api-v2-docs-beta/template`

This means:

1. you need to clone `api-v2-docs-beta` somewhere in your path, accessible to your command with relative path
2. You can use `subfolder` inside it, to group your docs under this specific subfolder namespace.

## Publishing your changes

In order to make your changes public using github pages, you need to do the following:

1. Git add and commit your newly generated files inside `/api-v2-docs-beta` repo: `git add --all && git commit -m 'Commit message'`
2. Git push to master, in order to save your change: `git push origin master`
3. Git push to GH pages, in order to publish it: `git push origin master:gh-pages`
