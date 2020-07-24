import { TextureFormat } from "@alipay/o3-base";
import { Engine } from "@alipay/o3-core";
import gl from "gl";
import { Texture2D } from "../src/Texture2D";

describe("Texture2D", () => {
  const width = 1024;
  const height = 1024;
  const rhi: any = {
    gl: gl(width, height),
    canIUse: jest.fn().mockReturnValue(true)
  };
  // mock engine
  Engine.defaultCreateObjectEngine = <any>{
    _hardwareRenderer: rhi
  };

  beforeEach(() => {
    rhi.isWebGL2 = false;
    delete rhi.gl.texStorage2D;
  });

  describe("格式测试", () => {
    it("不支持浮点纹理", () => {
      expect(() => {
        rhi.canIUse.mockReturnValueOnce(false);
        new Texture2D(width, height, TextureFormat.R32G32B32A32);
      }).toThrow();
    });
    it("引擎不支持的格式", () => {
      expect(() => {
        new Texture2D(width, height, 1234567);
      }).toThrow();
    });
  });

  describe("mipmap", () => {
    it("webgl2 支持非2次幂开启 mipmap ", () => {
      rhi.isWebGL2 = true;
      rhi.gl.texStorage2D = function () {};

      const texture1 = new Texture2D(100, 100);
      const texture2 = new Texture2D(100, 100, undefined, true);

      expect(texture1.mipmapCount).not.toBe(1);
      expect(texture2.mipmapCount).not.toBe(1);
    });
    it("关闭 mipmap 成功", () => {
      const texture = new Texture2D(width, height, undefined, false);

      expect(texture.mipmapCount).toBe(1);
    });
    it("webgl1 开启 mipmap 失败自动降级 - 非2次幂图片", () => {
      const texture1 = new Texture2D(100, 100);
      const texture2 = new Texture2D(100, 100, undefined, true);

      expect(texture1.mipmapCount).toBe(1);
      expect(texture2.mipmapCount).toBe(1);
    });
  });

  describe("设置颜色缓冲", () => {
    const texture = new Texture2D(width, height);
    const buffer = new Uint8Array(width * height * 4);

    it("默认匹配大小", () => {
      texture.setPixelBuffer(buffer);
    });
    it("设置 mip 数据", () => {
      texture.setPixelBuffer(buffer, 1);
    });
    it("手动设置偏移和宽高", () => {
      texture.setPixelBuffer(buffer, 1, 0, 0, width, height);
    });
    it("浮点纹理写入数据", () => {
      const texture = new Texture2D(width, height, TextureFormat.R32G32B32A32);
      const buffer = new Float32Array(4);

      texture.setPixelBuffer(buffer);
      texture.setPixelBuffer(buffer, 1, 0, 0, 1, 1);
    });
  });

  describe("读取颜色缓冲", () => {
    it("异常-无法读取压缩纹理", () => {
      expect(() => {
        const texture = new Texture2D(width, height, TextureFormat.ETC2_RGBA8);
        const buffer = new Uint8Array(4);

        texture.getPixelBuffer(0, 0, 1, 1, buffer);
      }).toThrow();
    });
    it("读取成功", () => {
      const texture = new Texture2D(width, height);
      const buffer = new Uint8Array(4);

      texture.setPixelBuffer(new Uint8Array([1, 2, 3, 4]), 0, 5, 0, 1, 1);
      texture.getPixelBuffer(5, 0, 1, 1, buffer);

      expect(buffer[0]).toBe(1);
      expect(buffer[1]).toBe(2);
      expect(buffer[2]).toBe(3);
      expect(buffer[3]).toBe(4);
    });
  });
});
