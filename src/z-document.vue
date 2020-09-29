<template>
  <div class="zd">
    <div class="zd-toolbar">
      <button @click="replay">replay command record</button>
      <!-- <span v-for="item in toolbarMenus" class="zd-toolbar-{{item.key}}">{{item.name||item.key}}</span> -->
    </div>
    <div class="zd-editor" ref="editor" :style="editStyle" @mousedown="onEditorMouseDown" @mouseup="onEditorMouseUp"
      @mousemove="onEditorMouseMove">
      <span :style="cursorStyle" class="zd-cursor"></span>
      <p class="zd-block" v-for="block in blocksForRender">
        <div v-html="block.html"></div>
        <div class="overlay" :style="block.overlayStyle"></div>
      </p>

    </div>
  </div>
</template>

<script>
  import Keyboard from './modules/keyboard';
  import History from './modules/history';
  import Model from './modules/model';


  import sizeUtil from './libs/sizeUtil';
  import {COMMAND_CONFIG} from './libs/commandUtil';

  const EDIT_SOURCE_CONFIG = {
    UNDO:"UNDO",
    USER_EDIT:"USER_EDIT"
  }
  const PAGE_CONFIG = {
    PADDING_TOP: 15,
    PADDING_LEFT: 15
  }

  export default {
    name: 'App',
    data() {
      return {
        commands: [],
        cursorStyle: {},
        blocks: [],
        cursorInfo: {
          locationX: 0,
          locationY: 0
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
      
        editStyle: {
          paddingTop: PAGE_CONFIG.PADDING_TOP + 'px',
          paddingBottom: PAGE_CONFIG.PADDING_TOP + 'px',
          paddingLeft: PAGE_CONFIG.PADDING_LEFT + 'px',
          paddingRight: PAGE_CONFIG.PADDING_LEFT + 'px'
        }
      }
    },
    components: {},
    methods: {
      undo() {
        this.flush(this.history.undo(),{editSource:EDIT_SOURCE_CONFIG.UNDO});
      },
      flush(command,{editSource = EDIT_SOURCE_CONFIG.USER_EDIT} = {}) {
        if (command) {
          this.commands.push(command);
          this.updateModel(command,{editSource});
        }
        this.updateCursor();

      },
      updateSpacers(spacers) {
        this.model.updateSpacers(spacers);
        this.updateBlocks();
      },
      getCursorSpacerIndex() {
        let blocksLocationXCount = 0;
        if (this.cursorInfo.locationY > 0) {
          let list = this.blocks.slice(0, this.cursorInfo.locationY);
          let count = 0;
          list.forEach(item => count += item.html.length);
          blocksLocationXCount = count + this.cursorInfo.locationY;
        }
        let result = blocksLocationXCount + this.cursorInfo.locationX;
        return result;
      },
      getCurrentCursorLoctionX() {
        let lastBlock = this.getCurrentBlock();
        return lastBlock.html.length;
      },
      updateCurrentCursorLocationX(locationX) {
        if(typeof locationX === 'undefined'){
          this.cursorInfo.locationX = this.getCurrentCursorLoctionX();
        }else{
          this.cursorInfo.locationX = locationX;
        }
      },
      updateModel(command, {
        editSource = EDIT_SOURCE_CONFIG.USER_EDIT
      }={}) {
        if (command.type === COMMAND_CONFIG.INSERT_CHARTER) {
          let startIndex = command.startIndex;
          if (editSource === EDIT_SOURCE_CONFIG.USER_EDIT) {
            this.history.record({
              type: COMMAND_CONFIG.DELETE_CHARTER,
              startIndex: startIndex + 1
            });
          }

          let newSpacers = this.model.insertStr(startIndex, command.value);
          this.updateSpacers(newSpacers);
          if (command.value === '\n') {
            this.cursorInfo.locationY += 1;
            this.cursorInfo.locationX = 0;
          } else {
            this.cursorInfo.locationX += 1;
          }
        } else if (command.type === COMMAND_CONFIG.DELETE_CHARTER) {
          let startIndex = command.startIndex;
          if(startIndex === 0){
            return;
          }
          let deleteCharterValue = this.model.spacers.substr(startIndex-1, 1);
          if (editSource === EDIT_SOURCE_CONFIG.USER_EDIT) {
            this.history.record({
              type: COMMAND_CONFIG.INSERT_CHARTER,
              startIndex: startIndex,
              value: deleteCharterValue
            })
          }
          this.removeSpackerIndex(startIndex - 1);
        }

      },
      removeSpackerIndex(targetSpacerIndex) {
        let deleteCharterValue = this.model.getSpackerAt(targetSpacerIndex);
      

        if (deleteCharterValue === '\n') {
           let locationX;
          if(this.cursorInfo.locationY>0){
             locationX = this.blocks[this.cursorInfo.locationY-1].html.length;
          }

          this.cursorInfo.locationY -= 1;
        
          this.updateCurrentCursorLocationX(locationX);
        } else {
          this.cursorInfo.locationX -= 1;
        }
        let newSpacers = this.model.removeStr(targetSpacerIndex);
        this.updateSpacers(newSpacers);
      },
      updateBlocks() {
        let spacerBlocks = this.model.getSpackers().split('\n');
        let blocks = spacerBlocks.map((item) => {
          return {
            html: item
          }
        });
        this.blocks = blocks;
        this.blocksForRender = this.blocks.map((item) => {
          let html = item.html.replace(/\s/g, '&nbsp;');
          let size = sizeUtil.getHtmlSize(html);
          return {
            html: html,
            overlayStyle: {
              width: size.width + 'px',
              height: size.height + 'px'
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
          left: PAGE_CONFIG.PADDING_LEFT + sizeUtil.getHtmlSize((block.html).substr(0, this.cursorInfo.locationX))
            .width + 'px',
          top: PAGE_CONFIG.PADDING_TOP + 20 * this.cursorInfo.locationY + 'px'
        }
      },
      onEditorMouseDown() {
        this.startMouse = true;
        this.curorMoveInfo = [0, 0, 0, 0] //左上，右上，左下，右下
      },
      onEditorMouseUp() {
        this.startMouse = false;

      },
      onEditorMouseMove(e) {
        if (this.startMouse) {
          console.log(e);
        }

      },
      _replay(commands){
        if(commands.length === 0){
          return;
        }
          let command = commands[0];
          
          setTimeout(()=>{
             this.flush(command);
             commands.splice(0,1);
             this._replay(commands);
          },200);
      
      },
      replay(){
        let replayCommands = JSON.parse(JSON.stringify(this.commands));
        this.clearCommands();
        this._replay(replayCommands);
      },
      clearCommands(){

        this.commands = [];
        this.model = new Model();
        this.cursorStyle = {};
        this.blocks =  [];
        this.cursorInfo =  {
          locationX: 0,
          locationY: 0
        };
      },
      getRoot(){
        return window;
        // return this.$refs.editor;
      },
      getSelection(){
        return [ this.getCursorSpacerIndex(), this.getCursorSpacerIndex()]
      }
    },
    mounted() {
        this.keyboard = new Keyboard(this);
        this.history = new History();
        this.model = new Model();

    }
  }
</script>
