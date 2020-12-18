<template>
  <div id="contents">
    <div id="sky">
      <div id="sky-mes">
        <h1>404 Not Found</h1>
        <p>お探しのページは存在しないか削除されています</p>
      </div>
    </div>
    <div id="yagi">
      <img src="//tsumugu.tech/images/404.png" alt="ヤギさん" width="300px">
    </div>
  </div>
</template>

<script>
</script>

<style  lang="scss">
* {
  font-family: sans-serif;
}
html, body {
  height:100%;
  margin: 0px 0px 0px;
  overflow: hidden;
}
h1, p {
  margin: 0px 0px 0px;
  padding: 5px 5px 5px;
}
#contents {
  height: 100%;
  color: white;
  background-color: #90c21e;
}
#sky {
  margin: 0px 0px 0px;
  padding: 5px 5px 5px 10px;
  width: 100%;
  height: 150px;
  background-color: #57bcf2;
  z-index: 2;
}
#sky-mes {
  display: inline-block;
  vertical-align: top;
}
#yagi {
  padding-left: 10px;
}
#bg {
  width: 100%;
  height:100%;
  background-color: #90c21e;
  z-index: 1;
}
</style>