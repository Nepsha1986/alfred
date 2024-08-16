# Alfred the Handbook Assistant

**Alfred** is a tool designed to help you create and edit content written in .mdx format. Please note that this project
is currently under development and not yet ready for production use.

## Installation

To get started with Alfred, first, install the necessary dependencies:

```bash
npm install
```

Next, create a configuration file named `alf.config.json` in the root of your project. This file will store your
API key and base URL.

```json
{
  "apiKey": "your-ai-api-key",
  "baseUrl": "your-ai-api-url"
}
```

Finally, update your package.json to include a script for running Alfred:

```
"scripts": {
  "assist": "alfred"
}
```

You can now run Alfred by typing the following command in your terminal:

```bash
npm run assist
```
