import { WeChatArticleData } from "./types";

// 微信API接口
const ACCESS_TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token";
const DRAFT_ADD_URL = "https://api.weixin.qq.com/cgi-bin/draft/add";

const PUBLISH_URL = "https://api.weixin.qq.com/cgi-bin/freepublish/submit";
const UPLOAD_IMG_URL = "https://api.weixin.qq.com/cgi-bin/media/uploadimg"; // 上传图片到微信服务器的永久素材接口
const UPLOAD_material_URL =
  "https://api.weixin.qq.com/cgi-bin/material/add_material"; // 上传永久

const CraftApi = () => {
  // Access Token 缓存
  const tokenCache: {
    access_token: string | null;
    expires_at: Date | null;
  } = {
    access_token: null,
    expires_at: null,
  };
  const uploadMaterial = async (
    url: string,
    isMaterial: boolean = false
  ): Promise<{
    type: string;
    media_id: string;
    created_at: number;
  }> => {
    const accessToken = await getAccessToken();

    const imageResponse = await fetch(url);
    const blob = await imageResponse.blob();

    const formData = new FormData();
    formData.append("media", blob, "image.jpg");

    const uploadUrl = isMaterial ? UPLOAD_material_URL : UPLOAD_IMG_URL;
    const response = await fetch(`${uploadUrl}?access_token=${accessToken}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.errcode) {
      throw new Error(`上传素材失败: ${data.errmsg}`);
    }

    return data;
  };

  const postCraft = async (
    craft: WeChatArticleData
  ): Promise<{
    media_id: string;
  }> => {
    const thumb_url = craft.thumb_url;
    const { media_id: thumb_media_id } = await uploadMaterial(thumb_url, true);
    const accessToken = await getAccessToken();

    const articles = {
      title: craft.title,
      author: craft.author,
      digest: craft.digest,
      content: craft.content,
      content_source_url: craft.content_source_url,
      need_open_comment: 1,
      thumb_media_id,
    };

    const url = `${DRAFT_ADD_URL}?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        articles: [articles],
      }),
    });

    if (!response.ok) {
      throw new Error(`草稿保存失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  };

  const publishCraft = async (craft_media_id: string) => {
    const accessToken = await getAccessToken();

    const url = `${PUBLISH_URL}?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        media_id: craft_media_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`发布草稿失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  };

  const getAccessToken = async () => {
    const now = new Date();

    const appId = process.env.WEIXIN_APPID;
    const appSecret = process.env.WEIXIN_APPSECRET;

    if (!appId || !appSecret) {
      throw new Error(
        "微信公众号配置未设置，请检查环境变量 WEIXIN_APPID 和 WEIXIN_APPSECRET"
      );
    }

    // 检查缓存的token是否有效
    if (
      tokenCache.access_token &&
      tokenCache.expires_at &&
      now < tokenCache.expires_at
    ) {
      console.log("使用缓存的access_token");
      return tokenCache.access_token;
    }

    try {
      console.log("正在获取新的access_token...");
      const params = new URLSearchParams({
        grant_type: "client_credential",
        appid: appId,
        secret: appSecret,
      });

      const response = await fetch(`${ACCESS_TOKEN_URL}?${params}`);
      const data: {
        errcode?: number;
        errmsg?: string;
        access_token?: string;
        expires_in?: number;
        media_id?: string;
        publish_id?: string;
        url?: string;
      } = await response.json();

      if (data.access_token) {
        // 缓存token，设置过期时间比实际提前5分钟
        tokenCache.access_token = data.access_token;
        tokenCache.expires_at = new Date(
          now.getTime() + (data.expires_in! - 300) * 1000
        );

        console.log(`获取access_token成功，有效期至: ${tokenCache.expires_at}`);
        return data.access_token;
      } else {
        throw new Error(`获取access_token失败: ${data.errmsg || "未知错误"}`);
      }
    } catch (error) {
      console.error("获取access_token时发生错误:", error);
      throw error;
    }
  };

  return {
    uploadMaterial,
    postCraft,
    publishCraft,
  };
};

const craftApi = CraftApi();
export default craftApi;
