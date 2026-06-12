import Markdown from '@/adapters/markdown.js';

export default class RenderPipeline {
  constructor(renderer = new Markdown()) {
    this.renderer = renderer;
    this.renderSeq = 0;
  }

  async requestRender(source, publish) {
    const seq = ++this.renderSeq;
    const html = await this.renderer.render(source);

    if (seq === this.renderSeq) {
      publish(html);
    }
  }

  discardPendingResults() {
    this.renderSeq++;
  }
}
