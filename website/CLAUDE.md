# Bash commands
- nvm use: load the correct npm version using nvm
- pnpm run start: start the project

# Code style
- angular components: always standalone, changeDetection: OnPush, never single files
- models don't have suffixes, pages are *.page.ts, servies are *.service.ts
- by default, services are not provided in root, and injected in `*.routes.ts` files for routes that need them
- only `core` services are provided in root

# Architecture
- split business domains in separated `feature` folders in folder `src/feature`, that can't import between them
- `core` contains all models, services and components that are reused in MULTIPLE FEATURES (domains)
- if a code should be reused in another feature, move it to the `core` folder
- `ui` should only contain dumb components
- always lazy-load pages

# UI/UX
- avoid creating custom visual components, always prefer existing Ionic Components: https://ionicframework.com/docs/components
- do the least amount possible of custom CSS,
- when needing custom CSS, check files `src/theme/*.*` to reuse existing classes
- all basic styles like font sizes, colors, margins, ... should be using default classes in `variables.scss` and `common-classes.scss`
- try to keep the design simple, clean, elegant

# Workflow
- nothing in particular yet
