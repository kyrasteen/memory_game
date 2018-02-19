// set in storage?
// randomize data match id assignments
// different levels of difficulty - time of flipped tile
// message on complete?

// states:
// flipped - up to two active tiles at a time
// expanded
// matched
// standard

// how can I decrease amount of DOM queries?
// how can I keep functions pure?
// how can I remove cross model dependencies?

const STATUSES = {
  EXPANDED: 'expanded',
  FLIPPED: 'flipped',
  MATCHED: 'matched',
  UNMATCHED: 'unmatched',
};

const statusClassMap = {
  [STATUSES.EXPANDED]: 'match-beest__tile--expanded',
  [STATUSES.FLIPPED]: 'match-beest__tile--flipped',
  [STATUSES.MATCHED]: 'match-beest__tile--matched',
  [STATUSES.UNMATCHED]: 'match-beest__tile',
};

const statusSelectorMap = {
  [STATUSES.EXPANDED]: '.match-beest__tile--expanded',
  [STATUSES.FLIPPED]: '.match-beest__tile--flipped',
  [STATUSES.MATCHED]: '.match-beest__tile--matched',
  [STATUSES.UNMATCHED]: '.match-beest__tile',
};

// tile model
const Tile = {
  create: function(node) {
    return {
      id: node.dataset.id,
      matchId: node.dataset.matchId,
      isExpanded: false,
      toggleExpanded: function() {
        this.isExpanded = !this.isExpanded;
      },
    };
  },
};

// add 'ui' property under beest model and get rid of ui model
// beest model
const Matchbeest = {
  initialize: function() {
    this.ui = {
      tileNodes: this.mapClickHandlersToTiles(),
    };
    this.tiles = {
      all: this.createTiles(),
      unmatched: this.createTiles(),
      matched: [],
      flipped: [],
    };
  },

  mapClickHandlersToTiles: function() {
    const tileNodes = document.querySelectorAll(statusSelectorMap[STATUSES.UNMATCHED]);
    tileNodes.forEach(node => {
      node.onclick = this.handleTileClick.bind(this);
    });
    return tileNodes;
  },

  handleTileClick: function(ev) {
    const node = ev.target;
    const tile = Matchbeest.getTileById(node.dataset.id);
    const primaryFlippedTileNode = this.getPrimaryFlippedTileNode();

    const text = document.querySelector(`text[data-tile-id='${tile.id}']`);
    text.classList.toggle('match-beest__text--visible');

    if (tile.isExpanded) {
      node.classList.remove(statusClassMap[STATUSES.EXPANDED]);
      this.ui.tileNodes.forEach(node => {
        if (node.dataset.id !== tile.id) {
          node.classList.remove('match-beest__tile--fade');
        }
      });
      const staticNodes = document.querySelectorAll('.match-beest__tile--static');
      staticNodes.forEach(node => {
        node.classList.remove('match-beest__tile--fade');
      });
    } else {
      node.classList.add(statusClassMap[STATUSES.EXPANDED]);
      this.ui.tileNodes.forEach(node => {
        if (node.dataset.id !== tile.id) {
          node.classList.add('match-beest__tile--fade');
        }
      });
      const staticNodes = document.querySelectorAll('.match-beest__tile--static');
      staticNodes.forEach(node => {
        node.classList.add('match-beest__tile--fade');
      });
    }
    tile.toggleExpanded();
    // add border/stroke of where tile should be

    // only continue if a different tile was clicked than already flippped tile;
    if (!!primaryFlippedTileNode && this.getPrimaryFlippedTile().id !== tile.id) {
      if (this.isMatch(tile)) {
        node.classList.replace(statusClassMap[STATUSES.UNMATCHED], statusClassMap[STATUSES.MATCHED]);
        primaryFlippedTileNode.classList.replace(statusClassMap[STATUSES.FLIPPED], statusClassMap[STATUSES.MATCHED]);
        this.setMatched();
      } else {
        this.getPrimaryFlippedTileNode().classList.replace(
          statusClassMap[STATUSES.FLIPPED],
          statusClassMap[STATUSES.UNMATCHED]
        );
        node.classList.replace(statusClassMap[STATUSES.FLIPPED], statusClassMap[STATUSES.UNMATCHED]);
        this.setUnmatched();
      }
    } else if (!this.getPrimaryFlippedTile() && tile.isExpanded) {
      node.classList.replace(statusClassMap[STATUSES.UNMATCHED], statusClassMap[STATUSES.FLIPPED]);
      this.flipTile(tile);
    }
    // if there is already a flipped tile, and if matched
    // then set classname matched
    // add tiles to matched array

    // if there is already a flipped tile, and no match
    // keep classname to unmatched
    // set existing flipped tile to unmatched status
    // add tiles to unmatched array
    // remove existing flipped tile in flipped array

    // if flipped tiles is empty
    // just do the below
  },

  createTiles: function() {
    const tiles = [];
    this.ui.tileNodes.forEach(node => {
      tiles.push(Tile.create(node));
    });
    return tiles;
  },
  flipTile: function(tile) {
    this.tiles.unmatched = this.tiles.unmatched.filter(unmatchedTile => {
      return unmatchedTile.id !== tile.id;
    });
    this.tiles.flipped.push(tile);
  },
  setMatched: function() {
    this.tiles.matched = this.tiles.matched.concat(this.tiles.flipped);
    this.resetFlipped();
  },
  setUnmatched: function(tile) {
    this.tiles.unmatched = this.tiles.unmatched.concat(this.tiles.flipped);
    this.resetFlipped();
  },
  resetFlipped: function() {
    this.tiles.flipped = [];
  },
  getTileById: function(tileId) {
    return this.tiles.all.find(tile => tile.id === tileId);
  },
  getPrimaryFlippedTileNode: function() {
    if (!!this.getPrimaryFlippedTile()) {
      let primaryFlippedTileNode;
      this.ui.tileNodes.forEach(tileNode => {
        if (tileNode.dataset.id === this.getPrimaryFlippedTile().id) {
          primaryFlippedTileNode = tileNode;
        }
      });
      return primaryFlippedTileNode;
    }
  },
  getPrimaryFlippedTile: function() {
    return this.tiles.flipped[0];
  },
  isMatch: function(tile) {
    return tile.matchId === this.getPrimaryFlippedTile().matchId;
  },
};

Matchbeest.initialize();
