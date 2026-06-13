import Markdown from '@/adapters/markdown';

export default class RenderPipeline {
  renderer: Markdown;
  renderSeq: number;

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
