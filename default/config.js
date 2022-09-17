{
  node: {
    caption: ['id'],
    defaultIcon: true,
    /*
    icon: {
      'person': 'carbon:person',
    },
    color: {
      'person': 'blue',
      'dog': '@color',
    },
    size: {
      'dog': 20,
    },
    */
  },
  edge: {
    caption: ['label'],
    width: 3,
    opacity: 0.5,
  },
  
  layout: 'default',
  extraOptions: {
    physics:{
      solver: 'barnesHut',
      barnesHut: {
        gravitationalConstant: -5000,
        centralGravity: 0,
        springLength: 300,
        springConstant: 0.01,
        damping: 0.2,
      },
      minVelocity: 0.2,
      stabilization: {
        enabled: false,
      },
    },
  },
  
  /*
  layout: 'hierarchical',
  layoutSettings: {
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'UD',        // UD, DU, LR, RL
    sortMethod: 'hubsize',  // hubsize, directed
    shakeTowards: 'leaves'  // roots, leaves
  },
  */
  /*
  layout: 'map',
  layoutSettings: {
    lng: 'lng',
    lat: 'lat'
  },
  */
  /*
  layout: 'custom',
  layoutSettings: {
    x: 'x',
    y: 'y'
  },
  */
}
  