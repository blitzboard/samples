{
  node: {
    caption: ['name'],
    defaultIcon: true,
    onDoubleClick: (n) => window.open(n.url, '_blank'),
    onClick: (n) => {
      blitzboard.showLoader();

      let query = `
      SELECT ?url ?rank ?name ?name_ja ?thumb ?descr_ja WHERE {
        wd:${n.id} wdt:P171 ?url .
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

      let query2 = `
      SELECT ?url ?rank ?name ?name_ja ?thumb ?descr_ja WHERE {
        ?url wdt:P171 wd:${n.id} .
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
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
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
          if (!blitzboard.hasEdge(n.id, node.id)) {
            blitzboard.addEdge({
              from: n.id,
              to: node.id,
              labels: ['parent taxon'],
            });
          }
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query2)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          if (blitzboard.hasNode(id)) {
            continue;
          }
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
          if (!blitzboard.hasEdge(node.id, n.id)) {
            blitzboard.addEdge({
              from: node.id,
              to: n.id,
              labels: ['parent taxon'],
            });
          }
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
    
    }

  },
  edge: {
    caption: ['label'],
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
    direction: 'DU',        // UD, DU, LR, RL
    sortMethod: 'directed',  // hubsize, directed
    shakeTowards: 'leaves'  // roots, leaves
  },
}
