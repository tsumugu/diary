export default class ImgUploader {
    constructor(arg_axios) {
      this.axios = arg_axios
    }
    upload(files) {
      const body = new FormData()
      body.append('files[]', files)
      return this.axios.post('https://readme.tsumugu2626.xyz/edit/upload.php', body)
      // STUB
      /*
      return new Promise((resolve, reject) => {
        resolve("https://example.com/xxx.jpg");
      });
      */
    }
  }