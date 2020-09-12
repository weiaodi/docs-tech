
<template>
  <div class="zd">
    <div class="zd-toolbar">
      <span v-for="item in toolbarMenus" class="zd-toolbar-{{item.key}}">{{item.name||item.key}}</span>
    </div>
    <div class="zd-editor">
      <span :style="cursorStyle" class="zd-cursor"></span>
      <p class="zd-block" v-for="block in blocks">
        {{block.html}}
      </p>
    </div>
  </div>
</template>

<script>
  import keyboardUtil from './libs/keyboardUtil';
  import sizeUtil from './libs/sizeUtil';
  import spacerUtil from './libs/spacerUtil';

  export default {
    name: 'App',
    data() {
      return {
        commands: [],
        model: {
          spacers: ''
        },
        toolbarMenus: [{
          key: 'bold'
        }, {
          key: 'italic'
        }, {
          key: 'underline'
        }, {
          key: 'strikethrough'
        }],
        cursorInfo: {
          locationX: 0,
          locationY: 0
        },
        cursorStyle: {},
        blocks: []
      }
    },
    components: {
    },
    methods: {
      onKeyDown(e) {
        e.preventDefault();
      },
      onKeyUp(e) {
        var value = e.key;
        let command;

        if (keyboardUtil.isArrowUp(e)) {
          this.cursorInfo.locationY > 0 ? this.cursorInfo.locationY-- : this.cursorInfo.locationY;
        } else if (keyboardUtil.isArrowDown(e)) {
          if (this.cursorInfo.locationY < this.blocks.length-1) {
            this.cursorInfo.locationY++;
          }else{
            
          }
        } else if (keyboardUtil.isArrowLeft(e)) {
          this.cursorInfo.locationX > 0 ? this.cursorInfo.locationX-- : this.cursorInfo.locationX;
          // console.log(this.cursorInfo.locationX)
        } else if (keyboardUtil.isArrowRight(e)) {
          if ((this.cursorInfo.locationX + 1) <= this.getCurrentBlock().html.length) {
            this.cursorInfo.locationX++;
          }
        } else {
          if (keyboardUtil.isEnter(e) || keyboardUtil.isMetaLeft(e)) {
            value = '\n';
          }
          if (keyboardUtil.isShift(e)) {

          } else if (keyboardUtil.isBackspace(e)) {
            command = {
              type: 'deleteCharter',
              value: value
            };
          } else {
            command = {
              type: 'insertCharter',
              value: value
            };
          }
        }
        if (command) {
          this.commands.push(command);
          this.updateModel(command);
        }
        this.updateCursor();

        e.preventDefault();
        return false;
      },
      updateSpacers(spacers) {
        this.model.spacers = spacers;
        this.updateBlocks();
      },
      getNewSpacerStartIndex() {
        let blocksLocationXCount = 0;
        if (this.cursorInfo.locationY > 0) {
          let list = this.blocks.slice(0,this.cursorInfo.locationY);
          let count = 0;
          list.forEach(item=>count+=item.html.length);
          blocksLocationXCount = count+ this.cursorInfo.locationY;
        }
        let result = blocksLocationXCount + this.cursorInfo.locationX;
        return result;
      },
      updateModel(command) {
        if (command.type === 'insertCharter') {
          var startIndex = this.getNewSpacerStartIndex();
          let newSpacers = spacerUtil.insertStr(this.model.spacers, startIndex, command.value);
          this.updateSpacers(newSpacers);
          if (command.value === '\n') {
            this.cursorInfo.locationY += 1;
            this.cursorInfo.locationX = 0;
          } else {
            this.cursorInfo.locationX += 1;
          }
        } else if (command.type === 'deleteCharter') {
          let deleteCharterValue = this.model.spacers.substring(this.model.spacers.length - 1, this.model.spacers
            .length);
          this.updateSpacers(this.model.spacers.substr(0, this.model.spacers.length - 1));

          if (deleteCharterValue === '\n') {
            this.cursorInfo.locationY -= 1;
            this.cursorInfo.locationX = this.getCurrentBlock().html.length;
          } else {
            this.cursorInfo.locationX -= 1;
          }
        }

      },
      updateBlocks() {
        let spacerBlocks = this.model.spacers.split('\n');
        var blocks = spacerBlocks.map((item) => {
          return {
            html: item
          }
        });
        this.blocks = blocks;

      },
      getCurrentBlock() {
        this.updateBlocks();
        return this.blocks[this.cursorInfo.locationY] || {
          html: ''
        };
      },
      updateCursor() {
        var bloczdount = this.blocks.length;
        let block = this.getCurrentBlock();
        this.cursorStyle = {
          left: 15 + sizeUtil.getHtmlSize((block.html).substr(0, this.cursorInfo.locationX)).width + 'px',
          top: 20 * this.cursorInfo.locationY + 15 + 'px'
        }
      }
    },
    mounted() {
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);

    }
  }
</script>
