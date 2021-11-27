
{
  node: {
    caption: ['id'],
    saturation: '100%',
    brightness: '37%',
    onClick: (n) => {
      let query = `
        select ?airport ?label ?thumb SAMPLE(?lat_) as ?lat  SAMPLE(?lon_) as ?lon (COUNT(?airline) as ?degree) WHERE {
          VALUES ?src{ <${n.url}> }
          ?src ?p ?airline.
          ?airport ?p2 ?airline.
          ?airline a dbo:Airline.
          ?airport a dbo:Airport;
                geo:lat ?lat_;
                geo:long ?lon_;
                rdfs:label ?label.
          FILTER(lang(?label) = 'en')
          FILTER(?src != ?airport)
          ?airport dbo:thumbnail ?thumb  
        } GROUP BY ?airport ?label ?thumb
          ORDER BY DESC(?degree)
          LIMIT 20.
      `;
      blitzboard.showLoader();
      $.get(`https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        let newPg = editor.getValue();
        for(let b of result.results.bindings) {
          let id = b.airport.value.replaceAll(/.*\//g, '');
          if(blitzboard.nodeMap[id])
            continue;
          let node = {
            id,
            labels: ['Page'],
            properties: {
              url: [b.airport.value],
              name: [b.label.value],
              lat: [b.lat.value],
              lng: [b.lon.value]
            }
          };
          if(b.thumb?.value)
            node.properties.thumbnail = [b.thumb.value];
          blitzboard.addNode(node, false);
          blitzboard.addEdge({
            from: n.id,
            to: id,
            direction: '->',
            labels: ['rel'],
            properties: {
              degree: [(parseInt(b.degree.value) / 10 + 1).toString()]
            }
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
      rel: 'degree',
    },
    saturation: '0%',
    brightness: '62%',
  },
  zoom: {
    max: 3.0,
    min: 0.25,
  },
  layout: 'map'
}
  