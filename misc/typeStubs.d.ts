declare module "buffer" {
  global {
    interface Buffer {
      write(string: string, encoding?: never): number;
      write(string: string, offset: number, encoding?: never): number;
      write(
        string: string,
        offset: number,
        length: number,
        encoding?: never
      ): number;
      toString(encoding?: never, start?: number, end?: number): string;
      toJSON(): { type: "Buffer"; data: number[] };
      equals(otherBuffer: Uint8Array): boolean;
      compare(
        target: Uint8Array,
        targetStart?: number,
        targetEnd?: number,
        sourceStart?: number,
        sourceEnd?: number
      ): -1 | 0 | 1;
      copy(
        target: Uint8Array,
        targetStart?: number,
        sourceStart?: number,
        sourceEnd?: number
      ): number;
      writeBigInt64BE(value: bigint, offset?: number): number;
      writeBigInt64LE(value: bigint, offset?: number): number;
      writeBigUInt64BE(value: bigint, offset?: number): number;
      writeBigUint64BE(value: bigint, offset?: number): number;
      writeBigUInt64LE(value: bigint, offset?: number): number;
      writeBigUint64LE(value: bigint, offset?: number): number;
      writeUIntLE(value: number, offset: number, byteLength: number): number;
      writeUintLE(value: number, offset: number, byteLength: number): number;
      writeUIntBE(value: number, offset: number, byteLength: number): number;
      writeUintBE(value: number, offset: number, byteLength: number): number;
      writeIntLE(value: number, offset: number, byteLength: number): number;
      writeIntBE(value: number, offset: number, byteLength: number): number;
      readBigUInt64BE(offset?: number): bigint;
      readBigUint64BE(offset?: number): bigint;
      readBigUInt64LE(offset?: number): bigint;
      readBigUint64LE(offset?: number): bigint;
      readBigInt64BE(offset?: number): bigint;
      readBigInt64LE(offset?: number): bigint;
      readUIntLE(offset: number, byteLength: number): number;
      readUintLE(offset: number, byteLength: number): number;
      readUIntBE(offset: number, byteLength: number): number;
      readUintBE(offset: number, byteLength: number): number;
      readIntLE(offset: number, byteLength: number): number;
      readIntBE(offset: number, byteLength: number): number;
      readUInt8(offset?: number): number;
      readUint8(offset?: number): number;
      readUInt16LE(offset?: number): number;
      readUint16LE(offset?: number): number;
      readUInt16BE(offset?: number): number;
      readUint16BE(offset?: number): number;
      readUInt32LE(offset?: number): number;
      readUint32LE(offset?: number): number;
      readUInt32BE(offset?: number): number;
      readUint32BE(offset?: number): number;
      readInt8(offset?: number): number;
      readInt16LE(offset?: number): number;
      readInt16BE(offset?: number): number;
      readInt32LE(offset?: number): number;
      readInt32BE(offset?: number): number;
      readFloatLE(offset?: number): number;
      readFloatBE(offset?: number): number;
      readDoubleLE(offset?: number): number;
      readDoubleBE(offset?: number): number;
      reverse(): this;
      swap16(): this;
      swap32(): this;
      swap64(): this;
      writeUInt8(value: number, offset?: number): number;
      writeUint8(value: number, offset?: number): number;
      writeUInt16LE(value: number, offset?: number): number;
      writeUint16LE(value: number, offset?: number): number;
      writeUInt16BE(value: number, offset?: number): number;
      writeUint16BE(value: number, offset?: number): number;
      writeUInt32LE(value: number, offset?: number): number;
      writeUint32LE(value: number, offset?: number): number;
      writeUInt32BE(value: number, offset?: number): number;
      writeUint32BE(value: number, offset?: number): number;
      writeInt8(value: number, offset?: number): number;
      writeInt16LE(value: number, offset?: number): number;
      writeInt16BE(value: number, offset?: number): number;
      writeInt32LE(value: number, offset?: number): number;
      writeInt32BE(value: number, offset?: number): number;
      writeFloatLE(value: number, offset?: number): number;
      writeFloatBE(value: number, offset?: number): number;
      writeDoubleBE(value: number, offset?: number): number;
      fill(
        value: string | Uint8Array | number,
        offset?: number,
        end?: number,
        encoding?: never
      ): this;
      indexOf(
        value: string | number | Uint8Array,
        byteOffset?: number,
        encoding?: never
      ): number;
      lastIndexOf(
        value: string | number | Uint8Array,
        byteOffset?: number,
        encoding?: never
      ): number;
      includes(
        value: string | number | Buffer,
        byteOffset?: number,
        encoding?: never
      ): boolean;
    }
  }
}
