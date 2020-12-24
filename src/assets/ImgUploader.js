import ProgressPromise from 'progress-promise'
export default class ImgUploader {
    constructor(arg_axios) {
      this.axios = arg_axios
    }
    upload(files) {
      return new ProgressPromise((resolve, reject, progress) => {
        const config = {
          onUploadProgress: function(progressEvent) {
            var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            progress(percentCompleted)
          }
        }
        const body = new FormData()
        body.append('files[]', files)
        this.axios.post('https://readme.tsumugu2626.xyz/edit/upload.php', body, config).then(res => resolve(res)).catch(err => reject(err))
      })
    }
  }