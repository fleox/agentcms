import { decryptDatabase, encryptDatabase, encryptionParams, generatePassphrase, isEncryptedDatabase, SqlitePassphraseError } from "./sqliteCrypto";

describe("sqliteCrypto", () => {
  const plain = new TextEncoder().encode("SQLite format 3\0 some rows");

  it("round-trips, keeps the salt across saves, uses a fresh IV", async () => {
    const a = await encryptDatabase(plain, "a long passphrase");
    expect(isEncryptedDatabase(a)).toBe(true);
    expect(isEncryptedDatabase(plain)).toBe(false);
    expect(await decryptDatabase(a, "a long passphrase")).toEqual(plain);
    const b = await encryptDatabase(plain, "a long passphrase", encryptionParams(a));
    expect(encryptionParams(b).salt).toEqual(encryptionParams(a).salt);
    expect(b).not.toEqual(a);
  }, 20_000);

  it("rejects a wrong or missing passphrase and tampering", async () => {
    const enc = await encryptDatabase(plain, "a long passphrase");
    await expect(decryptDatabase(enc, "another passphrase")).rejects.toMatchObject({ reason: "wrong" });
    await expect(decryptDatabase(enc, null)).rejects.toBeInstanceOf(SqlitePassphraseError);
    const tampered = enc.slice();
    tampered[tampered.length - 1] ^= 1;
    await expect(decryptDatabase(tampered, "a long passphrase")).rejects.toMatchObject({ reason: "wrong" });
  }, 20_000);

  it("generates readable random passphrases", () => {
    const p = generatePassphrase();
    expect(p).toMatch(/^[a-z2-9]{5}(-[a-z2-9]{5}){5}$/);
    expect(generatePassphrase()).not.toBe(p);
  });
});
