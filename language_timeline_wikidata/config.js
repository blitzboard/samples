
{
  node: {
    caption: ['name'],
    defaultIcon: true,
    icon: {
      "Programming Language": "ant-design:code-filled"
    },
    onDoubleClick: (n) => window.open(n.url, '_blank'),
    onClick: (n) => {
      blitzboard.showLoader();
      let query = `
      select ?url ?date ?name ?propLabel ?thumb where  {
        {wd:${n.id} ?link ?url.} UNION {?url ?link wd:${n.id}}    
        ?url wdt:P31 wd:Q9143;
                 wdt:P571 ?date;
                 rdfs:label ?name.
        OPTIONAL { ?url wdt:P154 ?thumb . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
        ?prop wikibase:directClaim ?link .
        FILTER(lang(?name) = 'en')
      }
      `;
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        for(let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          if(blitzboard.hasNode(id))
            continue;
          let node = {
            id: id,
            labels: ['Programming Language'],
            properties: {
              url: [b.url.value],
              name: [b.name.value],
              start: [b.date.value],
              end: [b.date.value],
            }
          };
          if(b.thumb?.value)
            node.properties.thumbnail = [b.thumb.value];
          blitzboard.addNode(node, false);
          blitzboard.addEdge({
            from: n.id,
            to: node.id,
            labels: [b.propLabel.value],
          })
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
    
    }

  },
  edge: {
    caption: ['label'],
  },
  layout: 'timeline', 
  layoutSettings: {
    time_from: "start",
    time_to: "end"
  }
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
