# 🔐 Cryptotron.js

> A JavaScript library implementing classic ciphers — Caesar, Vigenère, and more.

Cryptotron.js is an educational cryptography library for experimenting with historical ciphers.
It’s not intended for secure applications, but is perfect for learning and demos.

---

## ✨ Features

- 🏛️ Classical Ciphers
  - Affine
  - Autokey
  - Beaufort
  - Caesar
  - Polybius Square
  - Running Key
  - Simple Substitution
  - Vigenère
  - More coming soon...
- 🔁 Symmetric encryption and decryption
- 📦 Lightweight and modular
- ✅ Includes unit tests

---

## 📦 Installation

```bash
npm install @jabez007/cryptotron.js
```

Or clone:

```bash
git clone https://github.com/jabez007/cryptotron.js.git
```

---

## 🚀 Usage

### Standard (Full) Version
For most Node.js, CLI, or desktop applications, use the default entry point. It includes all n-gram data (monograms through quadgrams) by default for synchronous cracking.

```js
const { caesar, vigenere } = require("@jabez007/cryptotron.js");

// Caesar Cipher
console.log(caesar.encrypt({ shift: 3 })("HELLO")); // "KHOOR"
console.log(caesar.decrypt({ shift: 3 })("KHOOR")); // "HELLO"

// Vigenère Cipher
console.log(vigenere.encrypt({ keyword: "KEY" })("HELLO")); // "RIJVS"
console.log(vigenere.decrypt({ keyword: "KEY" })("RIJVS")); // "HELLO"
```

### Lite Version (Browser-friendly)
If you're building a web application and want to minimize your initial bundle size, use the `@jabez007/cryptotron.js/lite` entry point. It excludes large n-gram data files (trigrams and quadgrams), which are roughly 6.5MB.

You can then lazy-load the data only when needed (e.g., before performing cryptanalysis/cracking).

```js
import { loadNgramData, substitution } from "@jabez007/cryptotron.js/lite";

async function startCracking(ciphertext) {
  // Lazy-load quadgram data (~6.2MB) only when needed
  await loadNgramData(4);
  
  // Now you can use cracking functions
  const result = substitution.crack(ciphertext);
  console.log("Decrypted text:", result.plaintext);
}
```

---

## ⚠️ Disclaimer

This library is for educational and demonstration purposes only.
Do not use it in production systems for secure communications.
