{
  node: {
    caption: ['name'],
    defaultIcon: true,
    title: (n) => {
      let titleText = `<tr><td><a target"_blank" href="${n.url}">${n.id}</a></td><td><b>${n.name}</b></td></tr>`;
      Object.entries(n.properties).forEach(([key, value]) => {
        if (key === 'thumbnail' || key === 'url' || key === 'name') {
          // skip
        } else if (key === 'taxon rank') {
          titleText += `<tr valign="top"><td>rank</td><td>${value}</td></tr>`;
        } else if (key === 'taxon name') {
          titleText += `<tr valign="top"><td>name</td><td>${value}</td></tr>`;
        } else {
          titleText += `<tr valign="top"><td>${key}</td><td>${value}</td></tr>`;
        }
      });
      let image = '';
      if (n.thumbnail) {
        image = `<a target="_blank" href="${n.thumbnail}"><img src="${n.thumbnail}" height="200"></a>`;
      }
      return `<table style='fixed'>${titleText}</table>${image}`;
    },
    onDoubleClick: (n) => window.open(n.url, '_blank'),
    onClick: (n) => {
      blitzboard.showLoader();
      const endpoint = 'https://query.wikidata.org/sparql';

      const queryGetChild = createSparq(`wd:${n.id}`, '?url');
      $.get(`${endpoint}?query=${encodeURIComponent(queryGetChild)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          const node = createNode(b);
          createEdge(node.id, n.id);
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
      
      const queryGetParent = createSparq('?url', `wd:${n.id}`);
      $.get(`${endpoint}?query=${encodeURIComponent(queryGetParent)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          if (blitzboard.hasNode(id)) {
            continue;
          }
          const node = createNode(b);
          createEdge(n.id, node.id);
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });

      function createSparq(child, parent) {
        return `
        SELECT ?url ?rank ?name ?name_ja ?thumb ?descr_ja WHERE {
          ${child} wdt:P171 ${parent} .
          ?url wdt:P31 wd:Q16521 ;
               wdt:P105/rdfs:label ?rank ;
               wdt:P225 ?name ;
               rdfs:label ?name_ja .
          OPTIONAL {
            ?url wdt:P18 ?thumb .
          }
          OPTIONAL {
            ?url <http://schema.org/description> ?descr_ja .
            FILTER(lang(?descr_ja) = 'ja')
          }
          FILTER(lang(?rank) = 'en')
          FILTER(lang(?name_ja) = 'ja')
        }
        `;
      }
    
      function createNode(b) {
        let id = b.url.value.replace(/.*\//g, '');
        let node = {
          id: id,
          labels: ['Taxon'],
          properties: {
            url: [b.url.value],
            'taxon rank': [b.rank.value],
            'taxon name': [b.name.value],
            name: [b.name_ja.value],
          }
        };
        if (b.descr_ja?.value) {
          node.properties.description = [b.descr_ja.value];
        }
        if (b.thumb?.value) {
          node.properties.thumbnail = [b.thumb.value];
        }
        blitzboard.addNode(node, false);
        return node;
      }

      function createEdge(parent, child) {
        if (!blitzboard.hasEdge(parent, child)) {
          blitzboard.addEdge({
            from: parent,
            to: child,
            labels: ['child taxon'],
          });
        }
      }
    }

  },
  edge: {
    caption: [],
    opacity: 0.6
  },
  layout: 'hierarchical',
  layoutSettings: {
    enabled:true,
    levelSeparation: 150,
    nodeSpacing: 100,
    treeSpacing: 200,
    blockShifting: true,
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'LR',        // UD, DU, LR, RL
    sortMethod: 'directed',  // hubsize, directed
    shakeTowards: 'roots'  // roots, leaves
  },
  extraOptions: {
    interaction: {
      selectConnectedEdges: false,
      hover: true,
      hoverConnectedEdges: false,
      keyboard: true,
      navigationButtons: true
    }
  }
}
