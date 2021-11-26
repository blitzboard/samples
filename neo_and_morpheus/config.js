{
    node: {
      caption: ['name'],
      defaultIcon: true,
      onDoubleClick: (n) => window.open(n.url, '_blank'),
      onClick: (n) => {
        blitzboard.showLoader();
        let type = n.labels[0]
        if (type == "movie") {
                // movieがclickされた場合cast memberを表示する
                let query = `
                    select ?url ?date ?name ?propLabel ?thumb where  {
                    {wd:${n.id} ?link ?url.} UNION {?url ?link wd:${n.id}}  
                    ?url wdt:P106 wd:Q33999;   
                            wdt:P569 ?date;
                            rdfs:label ?name.
                    OPTIONAL { ?url wdt:P18 ?thumb . }
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
                    ?prop wikibase:directClaim ?link .
                    FILTER(lang(?name) = 'en')
                    }
                `;
                $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
                    console.log(result.results.bindings)
                    for(let b of result.results.bindings) {
                      let id = b.url.value.replace(/.*\//g, '');
                      if(blitzboard.hasNode(id))
                        continue;
                      let node = {
                        id: id,
                        labels: ['actor'],
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
                      if(!blitzboard.hasEdge(node.id, n.id))
                        blitzboard.addEdge({
                          from: node.id,
                          to: n.id,
                          labels: [b.propLabel.value],
                        })
                    }
                    
                    blitzboard.update();
                    blitzboard.hideLoader();
                  });
          
        } else {
            // actorがクリックされた場合
            // blitzboard.getAllNodes() 間で共起するmovieのみ表示する
            let allnodes = blitzboard.getAllNodes("actor");
            let actors = allnodes.filter((tmp) => tmp.id != n.id);
            let query = `
                        select DISTINCT ?movie ?movieLabel ?costar (MIN(?movieDate_) as ?movieDate) {
                VALUES ?costar { ${actors.map(a => `wd:${a.id}`).join(' ')} }
                { wd:${n.id} ?prop ?movie  } UNION { ?movie ?prop wd:${n.id} }
                { ?costar ?prop2 ?movie  } UNION { ?movie ?prop2 ?costar  }
                ?movie rdfs:label ?movieLabel;
                       wdt:P31 wd:Q11424.
                OPTIONAL { ?movie wdt:P577 ?movieDate_ }
                FILTER(lang(?movieLabel) = 'en')
              } GROUP BY ?movie ?movieLabel ?costar 
                `;

            $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
              for(let b of result.results.bindings) {
                console.log(b);
                console.log(b.movieLabel);
                let movieId = b.movie.value.replace(/.*\//g, '');
                let costarId = b.costar.value.replace(/.*\//g, '');
                let movieNode = {
                    id: movieId,
                    labels: ['movie'],
                    properties: {
                      url: [b.movie.value],
                      name: [b.movieLabel.value],
                      start: [b.movieDate.value],
                      end: [b.movieDate.value]
                    }
                };
                if(b.thumb?.value)
                    movieNode.properties.thumbnail = [b.thumb.value];
                blitzboard.addNode(movieNode, false);
                
                if(!blitzboard.hasEdge(n.id, movieId))
                  blitzboard.addEdge({
                      from: n.id,
                      to: movieId,
                  });
                if(!blitzboard.hasEdge(costarId, movieId))
                  blitzboard.addEdge({
                      from: costarId,
                      to: movieId,
                  });
              }
              blitzboard.update();
              blitzboard.hideLoader();
            });                
        }
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