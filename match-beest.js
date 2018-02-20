const STATUSES = {
  FLIPPED: 'flipped',
  MATCHED: 'matched',
  UNMATCHED: 'unmatched',
  STATIC: 'static',
  DISABLED: 'disabled',
};

const statusClassMap = {
  [STATUSES.FLIPPED]: 'match-beest__tile--flipped',
  [STATUSES.MATCHED]: 'match-beest__tile--matched',
  [STATUSES.UNMATCHED]: 'match-beest__tile',
  [STATUSES.STATIC]: 'match-beest__tile--static',
  [STATUSES.DISABLED]: 'match-beest__tile--disabled',
};

const statusSelectorMap = {
  [STATUSES.FLIPPED]: `.${statusClassMap[STATUSES.FLIPPED]}`,
  [STATUSES.MATCHED]: `.${statusClassMap[STATUSES.MATCHED]}`,
  [STATUSES.UNMATCHED]: `.${statusClassMap[STATUSES.UNMATCHED]}`,
  [STATUSES.STATIC]: `.${statusClassMap[STATUSES.STATIC]}`,
  [STATUSES.DISABLED]: `.${statusClassMap[STATUSES.DISABLED]}`,
};

// tile model
const Tile = {
  create: function(node) {
    return {
      id: node.dataset.id,
      matchId: node.dataset.matchId,
    };
  },
};

// beest model
const Matchbeest = {
  initialize: function() {
    this.ui = {
      tileNodes: [...this.mapClickHandlersToTiles()],
      toggleTextDisplay: this.toggleTextDisplay,
      resetDisplayedText: this.resetDisplayedText,
      getTextNodeByTileId: this.getTextNodeByTileId,
      replaceStatus: this.replaceStatus,
    };
    const tiles = this.createTiles();
    this.tiles = {
      all: tiles,
      unmatched: tiles.filter(tile => !!tile.matchId), // remove static tiles
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
    const text = this.ui.getTextNodeByTileId(tile);
    this.flipTile(tile, node);
    if (this.isFlipped(tile.id)) {
      if (this.isSecondaryFlippedTile(tile)) {
        this.determineMatch(tile, node);
        if (this.tiles.unmatched.length === 0) {
          this.handleWin();
        }
      } else {
        this.ui.resetDisplayedText();
      }
    } else {
      this.tiles.flipped.length === 0 && this.enableUnflippedTiles();
    }
    this.ui.toggleTextDisplay(text);
  },
  createTiles: function() {
    return this.ui.tileNodes.map(node => Tile.create(node));
  },
  getPrimaryFlippedTileNode: function() {
    return this.ui.tileNodes.find(tileNode => {
      return tileNode.dataset.id === this.getPrimaryFlippedTile().id;
    });
  },
  flipTile: function(tile, node) {
    if (this.isFlipped(tile.id)) {
      const updatedFlipped = this.tiles.flipped.filter(flippedTile => {
        return flippedTile.id !== tile.id;
      });
      const updatedUnmatched = this.tiles.unmatched.concat(tile);
      this.tiles = Object.assign({}, this.tiles, { flipped: updatedFlipped, unmatched: updatedUnmatched });
      this.ui.replaceStatus(node, STATUSES.FLIPPED, STATUSES.UNMATCHED);
    } else {
      const updatedUnmatched = this.tiles.unmatched.filter(unmatchedTile => {
        return unmatchedTile.id !== tile.id;
      });
      const updatedFlipped = this.tiles.flipped.concat(tile);
      this.tiles = Object.assign({}, this.tiles, { unmatched: updatedUnmatched, flipped: updatedFlipped });
      this.ui.replaceStatus(node, STATUSES.UNMATCHED, STATUSES.FLIPPED);
    }
  },
  getTileById: function(tileId, status = 'all') {
    return this.tiles[status].find(tile => tile.id === tileId);
  },
  isFlipped: function(tileId) {
    return !!this.getTileById(tileId, STATUSES.FLIPPED);
  },
  getPrimaryFlippedTile: function() {
    return this.tiles.flipped[0];
  },
  isSecondaryFlippedTile: function(tile) {
    return !!this.tiles.flipped[1] ? this.tiles.flipped[1] === tile : false;
  },
  isMatch: function(tile) {
    return tile.matchId === this.getPrimaryFlippedTile().matchId;
  },
  setMatched: function() {
    const updatedMatched = this.tiles.matched.concat(this.tiles.flipped);
    const updatedUnmatched = this.tiles.unmatched.filter(unmatchedTile => {
      return !this.getTileById(unmatchedTile.id, STATUSES.FLIPPED);
    });
    this.tiles = Object.assign({}, this.tiles, {
      matched: updatedMatched,
      flipped: [],
      unmatched: updatedUnmatched,
    });
  },
  determineMatch: function(tile, node) {
    const primaryFlippedTileNode = this.getPrimaryFlippedTileNode();
    if (this.isMatch(tile)) {
      this.ui.replaceStatus(node, STATUSES.FLIPPED, STATUSES.MATCHED);
      this.ui.replaceStatus(primaryFlippedTileNode, STATUSES.FLIPPED, STATUSES.MATCHED);
      this.setMatched();
    } else {
      this.isSecondaryFlippedTile(tile) ? this.disableUnflippedTiles() : this.enableUnflippedTiles();
    }
  },
  // DOM altering utils
  handleWin: function() {
    const matchBeest = document.querySelector('.match-beest');
    matchBeest.classList.add('match-beest--complete');
  },
  disableUnflippedTiles: function() {
    this.ui.tileNodes.forEach(node => {
      const isFlippedTile = this.isFlipped(node.dataset.id);
      !isFlippedTile && node.classList.add(statusClassMap[STATUSES.DISABLED]);
    });
  },
  enableUnflippedTiles: function() {
    const disabledNodes = document.querySelectorAll(statusSelectorMap[STATUSES.DISABLED]);
    disabledNodes.forEach(node => {
      node.classList.remove(statusClassMap[STATUSES.DISABLED]);
    });
  },
  resetDisplayedText: function() {
    document.querySelectorAll('.match-beest__text--visible').forEach(textNode => {
      this.toggleTextDisplay(textNode);
    });
  },
  toggleTextDisplay: function(text) {
    text.classList.toggle('match-beest__text--visible');
  },
  getTextNodeByTileId: function(tile) {
    return document.querySelector(`.match-beest__text[data-tile-id='${tile.id}']`);
  },
  replaceStatus: function(node, prevStatus, nextStatus) {
    node.classList.replace(statusClassMap[prevStatus], statusClassMap[nextStatus]);
  },
};

Matchbeest.initialize();
