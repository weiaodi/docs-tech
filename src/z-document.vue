<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="zd">
    <div class="zd-toolbar">
      <button @click="replay">replay command record</button>
      <!-- <span v-for="item in toolbarMenus" class="zd-toolbar-{{item.key}}">{{item.name||item.key}}</span> -->
    </div>
    <div
      ref="editor"
      class="zd-editor"
      :style="editStyle"
      @mousedown="onEditorMouseDown"
      @mouseup="onEditorMouseUp"
      @mousemove="onEditorMouseMove"
    >
      <span :style="cursorStyle" class="zd-cursor"></span>
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <div v-for="block in blocks" class="zd-block">
        <div v-html="block.html"></div>
        <div class="overlay" :style="block.overlayStyle"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Keyboard from './modules/keyboard';
import ModelState from './modules/modelState';
import PAGE_CONFIG from './modules/pageConfig';

const EDIT_SOURCE_CONFIG = {
  UNDO: 'UNDO',
  USER_EDIT: 'USER_EDIT',
};

export default {
  name: 'App',
  components: {},
  data() {
    return {
      toolbarMenus: [
        {
          key: 'bold',
        },
        {
          key: 'italic',
        },
        {
          key: 'underline',
        },
        {
          key: 'strikethrough',
        },
      ],
      cursorStyle: {},
      blocks: [],
      editStyle: {
        paddingTop: PAGE_CONFIG.PADDING_TOP + 'px',
        paddingBottom: PAGE_CONFIG.PADDING_TOP + 'px',
        paddingLeft: PAGE_CONFIG.PADDING_LEFT + 'px',
        paddingRight: PAGE_CONFIG.PADDING_LEFT + 'px',
      },
    };
  },
  mounted() {
    this.keyboard_ = new Keyboard(this);
    this.modeState_ = new ModelState();
  },
  methods: {
    undo() {
      this.flush(this.modeState_.undo(), {
        editSource: EDIT_SOURCE_CONFIG.UNDO,
      });
    },
    flush(command, { editSource = EDIT_SOURCE_CONFIG.USER_EDIT } = {}) {
      if (command) {
        this.modeState_.applyCommand(command, { editSource });
      }
      this.redraw();
    },
    redraw() {
      this.modeState_.updateBlocks();
      this.modeState_.updateCursor();

      this.blocks = this.modeState_.getBlocksForRedraw();
      this.cursorStyle = this.modeState_.getCursorStyle();
      // console.log(this.cursorStyle)
    },

    onEditorMouseDown() {
      this.startMouse = true;
      this.curorMoveInfo = [0, 0, 0, 0]; // 左上，右上，左下，右下
    },
    onEditorMouseUp() {
      this.startMouse = false;
    },
    onEditorMouseMove(e) {
      if (this.startMouse) {
        console.log(e);
      }
    },
    getRoot() {
      return window;
      // return this.$refs.editor;
    },
    getSelection() {
      return this.modeState_.getSelection();
    },
    getCursorInfo() {
      return this.modeState_.getCursorInfo();
    },
    updateCursorInfo() {
      this.modeState_.updateCursorInfo.apply(this.modeState_, arguments);
    },
    getCurrentBlockCharacterCount() {
      return this.modeState_.getCurrentBlock().html.length;
    },

    replay() {
      let _replay = (commands) => {
        if (commands.length === 0) {
          return;
        }
        let command = commands[0];

        setTimeout(() => {
          this.flush(command);
          commands.splice(0, 1);
          _replay(commands);
        }, 200);
      };
      let replayCommands = JSON.parse(JSON.stringify(this.modeState_.getCommands()));

      this.blocks = [];
      this.modeState_ = new ModelState();
      _replay(replayCommands);
    },
  },
};
</script>
