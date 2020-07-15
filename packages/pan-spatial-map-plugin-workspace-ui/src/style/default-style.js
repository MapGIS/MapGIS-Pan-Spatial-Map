export default {
  version: 8,
  name: '空样式',
  sources: {
    IGServer: {
      type: 'vector',
      tiles: [
        'http://localhost:6163/igs/rest/mrms/tile/IGServer/{z}/{y}/{x}?type=cpbf'
      ],
      minZoom: 0,
      maxZoom: 15
    }
  },
  sprite: 'http://localhost:6163/igs/rest/mrms/vtiles/sprite',
  glyphs:
    'http://localhost:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: '背景',
      type: 'background',
      paint: {
        'background-color': 'rgba(247, 247, 247, 1)'
      }
    }
  ]
}
