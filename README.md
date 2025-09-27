# Sagor-Bot-V2

**Sagor-Bot-V2** is a Facebook Messenger chatbot that runs with the help of your **Facebook account's appstate (cookies)**. This bot listens to your messages in Messenger and handles multiple useful commands.

# BOT RUNNING WORKFLOWS
```
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:


    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm install
    - run: npm start
```

##

- Facebook Messenger chatbot functionality
- Facebook login through `appstate.json` (cookies)
- 250+ built-in commands
- Easily customizable structure for developers

## 🧰 Requirements

- **Node.js version 18 or above (18+)**
- Facebook `appstate.json` file (login cookie JSON)

## ⚙️ Installation

### 1. Repository Clone Karein

```bash
git clone https://github.com/MDAMINULSARDAR/Goat-Bot-V2.git
cd mirai_Bot_v
```

### 2. Dependencies Installed

```bash
npm install
```

### 3. Facebook Appstate Add Do it

- Paste your Facebook account's `account.txt` file in the root folder.

- Ensure that the file is valid and updated.

### 4. Run the Bot

```bash
npm start
```

---

## 🚀 Usage

- The bot will login to your Facebook account as soon as it is launched.

- It listens to Messenger chats in the background.

- You can use available commands like:

```
/help
/uptime
/song [name]
/info
```
- The bot automatically tracks group and user data (if the database is configured).

---

## Fca type 
- You can use any one

```
aminul-new-fca
```
```
aminul-new-fca
```
---

## 🤝 Contributing

- Suggestions and pull requests are welcome!

- Before adding a new feature, please open an issue so that discussion can take place.

---

## 👨‍💻 Author

Developed with ❤️ by [MD.AMINUL SARDARttps://github.com/MDAMINULSARDAR)
