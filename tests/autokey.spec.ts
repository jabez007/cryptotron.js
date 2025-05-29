import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/autokey';

describe('Autokey', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({primer: "foobar"})("Hello World"), "Mszmo Nvvwo");
    });
  
    it('should handle encrypting messages multiple times', function () {
      const encryptor = encrypt({primer: "foobar"})

      assert.equal(encryptor("Lorem ipsum dolor sit amet"), "Qcffm zaglq pwagl elh lavl");
      assert.equal(encryptor("consectetuer adipiscing elit"), "hcbtetvsgmit thbjmjclvv mdkb");
    });

  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({primer: "foobar"})("Mszmo Nvvwo"), "Hello World");
    });
  
    it('should handle decrypting messages multiple times', function () {
      const decryptor = decrypt({primer: "foobar"})

      assert.equal(decryptor("Qcffm zaglq pwagl elh lavl"), "Lorem ipsum dolor sit amet");
      assert.equal(decryptor("hcbtetvsgmit thbjmjclvv mdkb"), "consectetuer adipiscing elit");
    });

  });
});

