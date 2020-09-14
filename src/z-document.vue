
<template>
  <div class="zd">
    <!-- <div class="zd-toolbar">
      <span v-for="item in toolbarMenus" class="zd-toolbar-{{item.key}}">{{item.name||item.key}}</span>
    </div> -->
    <div class="zd-editor" :style="editStyle" @mousedown="onEditorMouseDown" @mouseup="onEditorMouseUp" @mousemove="onEditorMouseMove">
      <span :style="cursorStyle" class="zd-cursor"></span>
      <p class="zd-block" v-for="block in blocksForRender">
        <div v-html="block.html"></div>
        <div class="overlay" :style="block.overlayStyle"></div>
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
        let value = e.key;
        let command;
        console.log(e)
        if (keyboardUtil.isArrowUp(e)) {
          this.cursorInfo.locationY > 0 ? this.cursorInfo.locationY-- : this.cursorInfo.locationY;
          this.updateCurrentCursorLocationX();
        } else if (keyboardUtil.isArrowDown(e)) {
          if (this.cursorInfo.locationY < this.blocks.length-1) {
            this.cursorInfo.locationY++;
          }else{
            
          }
        } else if (keyboardUtil.isArrowLeft(e)) {
          if(this.cursorInfo.locationX > 0){
             this.cursorInfo.locationX-- 
          }else{
            if(this.cursorInfo.locationY>0){
              this.cursorInfo.locationY--;
              this.updateCurrentCursorLocationX();
            }
          }
        } else if (keyboardUtil.isArrowRight(e)) {
          if ((this.cursorInfo.locationX + 1) <= this.getCurrentBlock().html.length) {
            this.cursorInfo.locationX++;
          }
        } else {
          if (keyboardUtil.isEnter(e)) {
            value = '\n';
          }
          if (keyboardUtil.isShift(e) || keyboardUtil.isMeta(e) ||keyboardUtil.isAlt(e)) {

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
      getCurrentCursorLoctionX(){
        let lastBlock = this.getCurrentBlock();
        return lastBlock.html.length;
      },
      updateCurrentCursorLocationX(){
          this.cursorInfo.locationX =  this.getCurrentCursorLoctionX();
      },
      updateModel(command) {
        if (command.type === 'insertCharter') {
          let startIndex = this.getCursorSpacerIndex();
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
            let deleteCharterValue = this.model.spacers.substring(this.getCursorSpacerIndex()-1, this.getCursorSpacerIndex());
            this.updateSpacers(spacerUtil.removeStr(this.model.spacers,this.getCursorSpacerIndex()-1));

          if (deleteCharterValue === '\n') {
            this.cursorInfo.locationY -= 1;
            this.updateCurrentCursorLocationX();
          } else {
            this.cursorInfo.locationX -= 1;
          }
        }

      },
      updateBlocks() {
        let spacerBlocks = this.model.spacers.split('\n');
        let blocks = spacerBlocks.map((item) => {
          return {
            html: item
          }
        });
        this.blocks = blocks;
        this.blocksForRender =  this.blocks .map((item) => {
           let html = item.html.replace(/\s/g,'&nbsp;');
           let size = sizeUtil.getHtmlSize(html);
          return {
            html: html,
            overlayStyle:{
              width: size.width+'px',
              height: size.height+'px',
              // display:'none'
            }
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
        let bloczdount = this.blocks.length;
        let block = this.getCurrentBlock();
        this.cursorStyle = {
          left: PAGE_CONFIG.PADDING_LEFT + sizeUtil.getHtmlSize((block.html).substr(0, this.cursorInfo.locationX)).width + 'px',
          top: PAGE_CONFIG.PADDING_TOP + 20 * this.cursorInfo.locationY + 'px'
        }
      },
      onEditorMouseDown(){
        this.startMouse = true;
        this.curorMoveInfo = [0,0,0,0] //左上，右上，左下，右下
      },
      onEditorMouseUp(){
        this.startMouse = false;

      },
      onEditorMouseMove(e){
        if(this.startMouse){
           console.log(e);
        }
       
      }
    },
    mounted() {
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);

    }
  }
</script>
