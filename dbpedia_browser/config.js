
{
  node: {
    caption: ['name'],
    icon: {
      person: 'f3a0',
      graph: 'f341',
      Page: 'ic:outline-article',
    },
    saturation: '100%',
    brightness: '37%',
    onClick: (n) => {
      let query = `
        select distinct ?page ?p ?id ?label ?thumb WHERE {
          <${n.url}> ?p ?page.
          ?page dbo:wikiPageID ?id;
                rdfs:label ?label.
          FILTER(lang(?label) = 'en')

            ?page dbo:thumbnail ?thumb

        } LIMIT 20.
      `;
      blitzboard.showLoader();
      $.get(`https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        let newPg = editor.getValue();
        for(let b of result.results.bindings) {
          let id = b.id.value;
          if(blitzboard.nodeMap[id])
            continue;
          let node = {
            id,
            labels: ['Page'],
            properties: {
              url: [b.page.value],
              name: [b.label.value],
            }
          };
          if(b.thumb?.value)
            node.properties.thumbnail = [b.thumb.value];
          blitzboard.addNode(node, false);
          blitzboard.addEdge({
            from: n.id,
            to: id,
            direction: '->',
            labels: [b.p.value],
          }, false);
        }
        blitzboard.update();      
        blitzboard.hideLoader();
      });
    }
  },
  edge: {
    caption: [],
    length: {
      distance: 'value', 
    },
    width: {
      flow: 'throughput',
    },
    saturation: '0%',
    brightness: '62%',
  },
  zoom: {
    max: 3.0,
    min: 0.25,
  },

  /*
  layout: 'hierarchical',
  layoutSettings: {
    enabled:true,
    levelSeparation: 150,
    nodeSpacing: 100,
    treeSpacing: 200,
    blockShifting: true,
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'UD',        // UD, DU, LR, RL
    sortMethod: 'hubsize',  // hubsize, directed
    shakeTowards: 'leaves'  // roots, leaves
  },
  layout: 'custom',
  layoutSettings: {
    x: 'x',
    y: 'y'
  },
  */
}
