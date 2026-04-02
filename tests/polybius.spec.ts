import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/polybius';

describe('Polybius Square', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("Hello World"), "BEBCCCCCAB EBABAECCBB");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("BEBCCCCCAB EBABAECCBB"), "hello world");
    });
  });

  describe('#crack', function () {
    this.timeout(60000);

    it('should recover most of the message with enough ciphertext', function () {
      const originalText = `THE POLYBIUS SQUARE, ALSO KNOWN AS THE POLYBIUS CHECKERBOARD, IS A DEVICE INVENTED BY THE ANCIENT GREEKS CLEOXENUS AND DEMOCLEITUS, AND MADE FAMOUS BY THE HISTORIAN POLYBIUS. THE DEVICE IS USED FOR FRACTIONATING PLAINTEXT CHARACTERS SO THAT THEY CAN BE REPRESENTED BY A SMALLER SET OF SYMBOLS, WHICH IS USEFUL FOR TELEGRAPHY, STEGANOGRAPHY, AND CRYPTOGRAPHY. THE DEVICE WAS ORIGINALLY USED FOR FIRE SIGNALLING, ALLOWING FOR THE OPTICAL TRANSMISSION OF ANY MESSAGE, RATHER THAN ONLY A LIMITED SET OF OPTIONS AS WAS THE CASE BEFORE. IN ITS SIMPLEST FORM, IT CONSISTS OF A FIVE BY FIVE GRID FILLED WITH THE LETTERS OF THE ALPHABET, WHERE I AND J USUALLY SHARE A SINGLE CELL TO FIT TWENTY-SIX LETTERS INTO TWENTY-FIVE SPACES.`;
      const keyword = "SECRET";
      const cipherChars = "12345";
      const ciphertext = encrypt({ keyword, cipherChars })(originalText);
      const result = crack(ciphertext);
      
      const decrypted = result.plaintext.toUpperCase();
      assert.ok(decrypted.includes("POLYBIUS"), `Expected 'POLYBIUS' in: ${decrypted}`);
      assert.ok(decrypted.includes("CHECKERBOARD"), `Expected 'CHECKERBOARD' in: ${decrypted}`);
      assert.ok(decrypted.includes("FRACTIONATING"), `Expected 'FRACTIONATING' in: ${decrypted}`);
    });
  });
});
