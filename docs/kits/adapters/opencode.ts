import { Plugin } from '@opencode/plugin';
export default Plugin.define({
  id: 'context-kit.continuity',

  async setup(ctx) {
    await ctx.session.hook('context', (event) => {
      event.system.push({
        type: 'text',
        text: 'Keep the latest goal, required constraints, source anchors and acceptance checks explicit. Verify the artifact against the goal.',
      });
    });
    await ctx.session.hook('compaction', (event) => {
      event.system.push({
        type: 'text',
        text:
          'Preserve the latest goal, constraints, source anchors, decisions, open work and ' +
          'verification status. Reload required facts after compaction.',
      });
    });
  },
});
