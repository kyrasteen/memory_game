const STATUSES = {
  ACTIVE: 'active',
  // INACTIVE: 'inactive',
  FLIPPED: 'flipped',
  MATCHED: 'matched',
  UNMATCHED: 'unmatched',
  STATIC: 'static',
};

const statusClassMap = {
  [STATUSES.ACTIVE]: 'match-beest__tile--active',
  // [STATUSES.INACTIVE]: 'match-beest__tile--inactive',
  [STATUSES.FLIPPED]: 'match-beest__tile--flipped',
  [STATUSES.MATCHED]: 'match-beest__tile--matched',
  [STATUSES.UNMATCHED]: 'match-beest__tile',
  [STATUSES.STATIC]: 'match-beest__tile--static',
};

const statusSelectorMap = {
  [STATUSES.ACTIVE]: `.${statusClassMap[STATUSES.ACTIVE]}`,
  // [STATUSES.INACTIVE]: `.${statusClassMap[STATUSES.INACTIVE]}`,
  [STATUSES.FLIPPED]: `.${statusClassMap[STATUSES.FLIPPED]}`,
  [STATUSES.MATCHED]: `.${statusClassMap[STATUSES.MATCHED]}`,
  [STATUSES.UNMATCHED]: `.${statusClassMap[STATUSES.UNMATCHED]}`,
  [STATUSES.STATIC]: `.${statusClassMap[STATUSES.STATIC]}`,
};

// tile model
const Tile = {
  create: function(node) {
    return {
      id: node.dataset.id,
      matchId: node.dataset.matchId,
      isActive: false,
      toggleActive: function() {
        this.isActive = !this.isActive;
      },
    };
  },
};

// beest model
const Matchbeest = {
  initialize: function() {
    this.ui = {
      tileNodes: [...this.mapClickHandlersToTiles()],
      staticNodes: [...this.getStaticNodes()],
      toggleActiveTileClass: this.toggleActiveTileClass,
      // toggleInActiveTileClass: this.toggleInActiveTileClass,
      toggleTextDisplay: this.toggleTextDisplay,
      getStaticNodes: this.getStaticNodes,
    };
    // changed 'flipped' to 'active'?
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
    const tile = this.getTileById(node.dataset.id);

    // move to state?
    const text = document.querySelector(`h5[data-tile-id='${tile.id}']`);

    // UI changes
    this.ui.toggleActiveTileClass(node);
    // this.ui.tileNodes.concat(this.ui.staticNodes).forEach(node => {
    //   if (node.dataset.id !== tile.id) {
    //     this.ui.toggleInActiveTileClass(node);
    //   }
    // });

    // data changes
    tile.toggleActive();

    if (tile.isActive) {
      this.flipTile(tile);
      if (this.isSecondaryFlippedTile(tile)) {
        this.ui.toggleTextDisplay(text);
        this.determineMatch(tile, node);
        if (this.tiles.matched.length === 2) {
          this.handleWin();
        }
      } else {
        // hide all current text
        document.querySelectorAll('.match-beest__text--visible').forEach(textNode => {
          this.ui.toggleTextDisplay(textNode);
        });

        // set visiblity on assoc text
        this.ui.toggleTextDisplay(text);

        node.classList.replace(statusClassMap[STATUSES.UNMATCHED], statusClassMap[STATUSES.FLIPPED]);
      }
    }
  },

  createTiles: function() {
    const tiles = [];
    this.ui.tileNodes.forEach(node => {
      tiles.push(Tile.create(node));
    });
    return tiles;
  },
  toggleActiveTileClass: function(tileNode) {
    tileNode.classList.toggle(statusClassMap[STATUSES.ACTIVE]);
  },
  // toggleInActiveTileClass: function(tileNode) {
  //   tileNode.classList.toggle(statusClassMap[STATUSES.INACTIVE]);
  // },
  toggleTextDisplay: function(text) {
    text.classList.toggle('match-beest__text--visible');
  },
  getStaticNodes: function() {
    return document.querySelectorAll(statusSelectorMap[STATUSES.STATIC]);
  },
  getPrimaryFlippedTileNode: function() {
    if (!!this.getPrimaryFlippedTile()) {
      return this.ui.tileNodes.find(tileNode => {
        return tileNode.dataset.id === this.getPrimaryFlippedTile().id;
      });
    }
  },
  setMatched: function() {
    this.tiles.matched = this.tiles.matched.concat(this.tiles.flipped);
    this.resetFlipped();
  },
  setUnmatched: function(tile) {
    this.tiles.unmatched = this.tiles.unmatched.concat(this.tiles.flipped);
    this.resetFlipped();
  },
  flipTile: function(tile) {
    // object assign
    this.tiles.unmatched = this.tiles.unmatched.filter(unmatchedTile => {
      return unmatchedTile.id !== tile.id;
    });
    this.tiles.flipped.push(tile);
  },
  resetFlipped: function() {
    this.tiles.flipped = [];
  },
  getTileById: function(tileId) {
    return this.tiles.all.find(tile => tile.id === tileId);
  },
  getPrimaryFlippedTile: function() {
    return this.tiles.flipped[0];
  },
  isSecondaryFlippedTile: function(tile) {
    return !!this.getPrimaryFlippedTile() && this.getPrimaryFlippedTile().id !== tile.id;
  },
  isMatch: function(tile) {
    return tile.matchId === this.getPrimaryFlippedTile().matchId;
  },
  determineMatch: function(tile, node) {
    const primaryFlippedClassList = this.getPrimaryFlippedTileNode().classList;
    if (this.isMatch(tile)) {
      node.classList.replace(statusClassMap[STATUSES.UNMATCHED], statusClassMap[STATUSES.MATCHED]);
      primaryFlippedClassList.replace(statusClassMap[STATUSES.FLIPPED], statusClassMap[STATUSES.MATCHED]);
      this.setMatched();
    } else {
      primaryFlippedClassList.replace(statusClassMap[STATUSES.FLIPPED], statusClassMap[STATUSES.UNMATCHED]);
      node.classList.replace(statusClassMap[STATUSES.FLIPPED], statusClassMap[STATUSES.UNMATCHED]);
      this.setUnmatched();
    }
  },
  handleWin: function() {
    // find mouth node, add class
    const matchBeest = document.querySelector('.match-beest');
    matchBeest.classList.add('match-beest--complete');
  },
};

Matchbeest.initialize();
