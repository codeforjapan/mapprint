<template>
  <div class="container">
    <header>
      <h1 class="title">
        <NuxtLink to="/">
          <Logo alt="カミマップ" />
        </NuxtLink>
      </h1>
    </header>
    
    <main class="main">
      <div class="maps">
        <p v-if="maps.length === 0">
          マップがロード中...
        </p>
        <div v-else class="map-grid">
          <div v-for="(map, index) in maps" :key="index" class="map-item">
            <NuxtLink :to="`/map/${map.map_id}`" class="map-link">
              <div class="map-image">
                <img :src="`/images/${map.map_image || 'logo.png'}`" alt="" />
              </div>
              <div class="map-title">
                {{ map.map_title }}
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <div class="footer-item">
        <i class="fas fa-info-circle"></i>
        <span>このサイトについて</span>
      </div>
      <div class="footer-item">
        <i class="fas fa-github"></i>
        <a href="https://github.com/codeforjapan/mapprint">貢献する</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Sample data - in a real app, you would fetch this from an API
const maps = ref([
  {
    map_id: 'sample-map',
    map_title: 'サンプルマップ',
    map_title_en: 'Sample Map',
    map_image: 'logo.png'
  }
]);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.map-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.map-item:hover {
  transform: translateY(-5px);
}

.map-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.map-image {
  height: 180px;
  overflow: hidden;
}

.map-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-title {
  padding: 1rem;
  font-weight: bold;
  text-align: center;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
}

.footer-item {
  margin: 0 1rem;
  display: flex;
  align-items: center;
}

.footer-item i {
  margin-right: 0.5rem;
}

.footer-item a {
  color: inherit;
  text-decoration: none;
}

.footer-item a:hover {
  text-decoration: underline;
}
</style>