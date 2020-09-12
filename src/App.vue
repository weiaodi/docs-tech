
<template>
  <div class="zd">
    <div class="zd-toolbar">
      <span v-for="item in toolbarMenus" class="zd-toolbar-{{item.key}}">{{item.name||item.key}}</span>
    </div>
    <div class="zd-editor" :style="editStyle">
      <span :style="cursorStyle" class="zd-cursor"></span>
      <p class="zd-block" v-for="block in blocksForRender" v-html="block.html">
       
      </p>
    </div>
  </div>
</template>

<script>
  import keyboardUtil from './libs/keyboardUtil';
  import sizeUtil from './libs/sizeUtil';
  import spacerUtil from './libs/spacerUtil';
 const PAGE_CONFIG = {
   PADDING_TOP:15,
   PADDING_LEFT:15
 }
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
        blocks: [],
        editStyle:{
           paddingTop: PAGE_CONFIG.PADDING_TOP+'px',
           paddingBottom: PAGE_CONFIG.PADDING_TOP+'px',
           paddingLeft: PAGE_CONFIG.PADDING_LEFT+'px',
           paddingRight: PAGE_CONFIG.PADDING_LEFT+'px'
        }
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
        // console.log(JSON.stringify(spacers))
        this.updateBlocks();
      },
      getCursorSpacerIndex() {
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
          var startIndex = this.getCursorSpacerIndex();
          let newSpacers = spacerUtil.insertStr(this.model.spacers, startIndex, command.value);
          this.updateSpacers(newSpacers);
          if (command.value === '\n') {
            this.cursorInfo.locationY += 1;
            this.cursorInfo.locationX = 0;
          } else {
            this.cursorInfo.locationX += 1;
          }
        } else if (command.type === 'deleteCharter') {
          // debugger;
            var lastBlock = this.getCurrentBlock();
            let deleteCharterValue = this.model.spacers.substring(this.getCursorSpacerIndex()-1, this.getCursorSpacerIndex());
            this.updateSpacers(spacerUtil.removeStr(this.model.spacers,this.getCursorSpacerIndex()-1));

          if (deleteCharterValue === '\n') {
            this.cursorInfo.locationY -= 1;
            this.cursorInfo.locationX = lastBlock.html.length;
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
        this.blocksForRender =  this.blocks .map((item) => {
          return {
            html: item.html.replace(/\s/g,'&nbsp;')
          }
        });

        
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
          left: PAGE_CONFIG.PADDING_LEFT + sizeUtil.getHtmlSize((block.html).substr(0, this.cursorInfo.locationX)).width + 'px',
          top: PAGE_CONFIG.PADDING_TOP + 20 * this.cursorInfo.locationY + 'px'
        }
      }
    },
    mounted() {
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);

    }
  }
</script>
