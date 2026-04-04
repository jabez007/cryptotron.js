import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/autokey';

describe('Autokey', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({primer: "foobar"})("Hello World"), "Mszmo Nvvwo");
    });
  
    it('should handle encrypting messages multiple times', function () {
      const encryptor = encrypt({primer: "foobar"});
      assert.strictEqual(encryptor("Lorem ipsum dolor sit amet"), "Qcffm zaglq pwagl elh lavl");
      assert.strictEqual(encryptor("consectetuer adipiscing elit"), "hcbtetvsgmit thbjmjclvv mdkb");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({primer: "foobar"})("Mszmo Nvvwo"), "Hello World");
    });
  
    it('should handle decrypting messages multiple times', function () {
      const decryptor = decrypt({primer: "foobar"});
      assert.strictEqual(decryptor("Qcffm zaglq pwagl elh lavl"), "Lorem ipsum dolor sit amet");
      assert.strictEqual(decryptor("hcbtetvsgmit thbjmjclvv mdkb"), "consectetuer adipiscing elit");
    });
  });

  describe('#crack', function () {
    this.timeout(20000);
    it('should recover the key and decrypt a long message', function () {
      const originalText = `AN AUTOKEY CIPHER IS A CIPHER THAT INCORPORATES THE MESSAGE INTO THE KEY. THE KEY IS GENERATED FROM THE MESSAGE IN SOME AUTOMATED FASHION, SOMETIMES BY SELECTING CERTAIN LETTERS OR BY USING THE ENTIRE MESSAGE AS THE KEY STARTING AFTER A SHORT INITIAL PRIMER. THERE ARE TWO MAIN TYPES OF AUTOKEY CIPHERS: THE KEY-AUTOKEY AND THE CIPHERTEXT-AUTOKEY. A KEY-AUTOKEY CIPHER USES PREVIOUS SEGMENTS OF THE PLAINTEXT TO DETERMINE THE NEXT ELEMENT IN THE KEY STREAM. THIS MAKES THE CIPHER MUCH MORE SECURE THAN THE REPEATING-KEY VIGENERE CIPHER BECAUSE THE KEY DOES NOT REPEAT. HOWEVER, IT IS STILL VULNERABLE TO FREQUENCY ANALYSIS IF THE MESSAGE IS LONG ENOUGH, AS THE STATISTICAL PROPERTIES OF THE LANGUAGE WILL STILL BE PRESENT IN THE KEY STREAM.`;
      const primer = "FOOBAR";
      const ciphertext = encrypt({ primer })(originalText);
      const result = crack(ciphertext);
      
      // Verify both plaintext and recovered primer
      assert.strictEqual(result.plaintext, originalText);
      assert.strictEqual(result.key.primer.toUpperCase(), primer.toUpperCase());
    });
  });
});
