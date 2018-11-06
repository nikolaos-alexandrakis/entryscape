  const filterNodesById = function (nodes, id) {
    return nodes.filter(n => n.id === id);
  };

  const filterNodesByType = function (nodes, value) {
    return nodes.filter(n => n.type === value);
  };

  /**
   * @exports entryscape-blocks/graphics/Graph
   */
  const Graph = class {
    constructor(selector, loadTriples, width, height) {
      const w = width || $(document).width();
      const h = height || $(document).height();
      this.loadTriples = loadTriples;
      this.svg = d3.select(selector).append('svg')
        .attr('width', w)
        .attr('height', h)
        .call(d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', () => {
          if (this.svgGroup && !this.dragging) {
            this.svgGroup.attr('transform',
              `translate(${d3.event.translate})scale(${d3.event.scale})`);
          }
        }));

      this.force = d3.layout.force().size([w, h]);
      this.force.charge(-500).linkDistance(50);

      // ==================== Force ====================
      this.force.on('tick', () => {
        if (this.nodesSel) {
          this.nodesSel
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
          this.linksSelDraw
            .attr('d', d => `M${d.s.x},${d.s.y
              }S${d.p.x},${d.p.y
              } ${d.o.x},${d.o.y}`);
          this.linksSelDetect
            .attr('d', d => `M${d.s.x},${d.s.y
              }S${d.p.x},${d.p.y
              } ${d.o.x},${d.o.y}`);
          this.nodeTextsSel
            .attr('x', d => d.x + 12)
            .attr('y', d => d.y + 3);
          this.linkTextsSel
            .attr('x', d => 4 + ((d.s.x + d.p.x + d.o.x) / 3))
            .attr('y', d => 4 + ((d.s.y + d.p.y + d.o.y) / 3));
        }
      });
      this.init();
    }

    init() {
      // ==================== Add Marker ====================
      this.svg.append('svg:defs').selectAll('marker')
        .data(['end', 'endhighlight'])
        .enter()
        .append('svg:marker')
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', d => (d === 'end' ? 25 : 17))
        .attr('refY', -0.5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('svg:polyline')
        .style('fill', 'black')
        .attr('points', '0,-5 10,0 0,5');
      this.svgGroup = this.svg.append('svg:g');

      this.svgLinks = this.svgGroup.append('svg:g');
      this.svgNodes = this.svgGroup.append('svg:g');
      this.svgLinkTexts = this.svgGroup.append('svg:g');
      this.svgNodeTexts = this.svgGroup.append('svg:g');
      this.nodes = [];
      this.triples = [];
      this.links = [];
      this.loaded = {};
    }

    load(id) {
      this.loadTriples(id, this.getLoadedNodes()).then((tripples) => {
        this.addTriples(tripples, [id]);
      });
    }

    clear() {
      this.svg.html('');
      this.init();
    }

    getLoadedNodes() {
      return this.loaded;
    }

    addTriples(triples, loaded) {
      loaded.forEach((l) => {
        this.loaded[l] = true;
      });
// Initial Graph from triples
      triples.forEach((triple) => {
        const subjId = triple.s;
        const predId = triple.p;
        const objId = triple.o;

        let subjNode = filterNodesById(this.nodes, subjId)[0];
        let objNode = filterNodesById(this.nodes, objId)[0];

        if (subjNode == null) {
          subjNode = { id: subjId, label: triple.sl, weight: 1, type: 'node' };
          this.nodes.push(subjNode);
        }
        if (this.loaded[subjNode.id]) {
          subjNode.loaded = true;
        }

        if (objNode == null) {
          objNode = { id: objId, label: triple.ol, weight: 1, type: 'node' };
          this.nodes.push(objNode);
        }
        if (this.loaded[objNode.id]) {
          objNode.loaded = true;
        }

        const predNode = { id: predId, label: triple.pl, weight: 1, type: 'pred' };
        this.nodes.push(predNode);

        const blankLabel = '';

        this.links.push({
          source: subjNode,
          target: predNode,
          predicate: blankLabel,
          weight: 1,
        });
        this.links.push({
          source: predNode,
          target: objNode,
          predicate: blankLabel,
          weight: 1,
        });

        this.triples.push({ s: subjNode, p: predNode, o: objNode });
      });

      // ==================== Update the force ====================
      this.force.stop()
        .nodes(this.nodes)
        .links(this.links)
        .start();
      this.update();
    }

    update() {
      // ==================== Add Links ====================
      const newLinks = this.svgLinks.selectAll('.link')
        .data(this.triples)
        .enter()
        .append('svg:g')
        .attr('class', 'link');

      const selLink = () => {
        const parent = d3.event.currentTarget.parentNode;
        $(parent).find('path.draw').attr('marker-end', 'url(#endhighlight)');
        $(parent).addClass('selectedPath');
      };
      const unSelLink = () => {
        const parent = d3.event.currentTarget.parentNode;
        $(parent).find('path.draw').attr('marker-end', 'url(#end)');
        $(parent).removeClass('selectedPath');
      };

      newLinks.append('path')
        .attr('class', 'draw')
        .attr('marker-end', 'url(#end)');

      newLinks.append('path')
        .attr('class', 'detect')
        .on('mouseenter', selLink)
        .on('mouseleave', unSelLink);
      this.linksSelDraw = this.svg.selectAll('.link path.draw');
      this.linksSelDetect = this.svg.selectAll('.link path.detect');

      newLinks.append('text')
        .text(d => d.p.label)
        .on('mouseenter', selLink)
        .on('mouseleave', unSelLink);

      this.linkTextsSel = this.svg.selectAll('.link text');

      // linkTexts.append("title")
      //   .text(function(d) { return d.predicate; });

      // ==================== Add node Names =====================
/*      this.svgNodeTexts.selectAll('.node-text')
        .data(filterNodesByType(this.nodes, 'node'))
        .enter()
        .append('text')
        .attr('class', 'node-text')
        .text(d => d.label);*/

      // nodeTexts.append("title")
      //    .text(function(d) { return d.label; });

      // ==================== Add Node =====================
      const newNodes = this.svgNodes.selectAll('.node')
        .data(filterNodesByType(this.nodes, 'node'))
        .attr('class', d => (d.loaded ? 'node loaded' : 'node'))
        .enter()
        .append('svg:g')
        .attr('class', d => (d.loaded ? 'node loaded' : 'node'));

      newNodes.append('text')
        .on('mouseenter', () => {
          $(d3.event.currentTarget.parentNode).addClass('selectedText');
        })
        .on('mouseleave', () => {
          $(d3.event.currentTarget.parentNode).removeClass('selectedText');
        })
        .text(d => d.label);
      this.nodeTextsSel = this.svg.selectAll('.node text');

      newNodes.append('circle')
        .attr('r', 8)
        .on('mouseenter', () => {
          $(d3.event.currentTarget.parentNode).addClass('selectedNode');
        })
        .on('mouseleave', () => {
          $(d3.event.currentTarget.parentNode).removeClass('selectedNode');
        })
        .on('dblclick', (d) => {
          this.clear();
          this.load(d.id);
        })
        .call(this.force.drag()
          .on('dragstart', () => {
            this.dragging = true;
          })
          .on('dragend', () => {
            this.dragging = false;
          }))
        .on('click', (d) => {
          if (!d.loaded) {
            d.loaded = true;
            this.load(d.id);
          }
        });
      this.nodesSel = this.svg.selectAll('circle');
    }
  };
  export default Graph;
