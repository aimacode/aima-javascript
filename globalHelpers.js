/**
  * Class to create an animation controller.
  * It creates the 'previous' button, 'next' button, slider and also attaches
  event listeners to them.
  * @example <caption>How to use AnimationController</caption>
  * <div class = 'row' id = 'someAC'></div>
  * <script>
  * let ac = new AnimationController({
  selector : '#someAC',
  min : 0,
  max : 15,
  renderer : (n) => {
    //Renders nth frame
  }
});
  * </script>
*/
class AnimationController {
  /**
   * Create Animation Controller.
   * @param {Object} options - Options for the controller
   * @param {String} options.selector - A selector to target the wrapper div for the controller.
   * @param {Number} options.min - Minimum value for the slider. Defaults to 0
   * @param {Number} options.max - Maximum value for the slider.
   * @param {Function} options.renderer - A function that can take the slider value and render the frame.
   */
  constructor(options) {
      //Initializing options
      this.selector = options.selector;
      this.min = options.min || 0;
      this.max = options.max;
      this.renderer = options.renderer;

      //Create Elements
      this.root = d3.select(this.selector);
      //Empty the root element
      this.root.selectAll('*').remove();
      this.prevButton = this.root.append('div')
        .attr('class', 'btn btn-default ACPrev col-md-2')
        .text('Previous');

      this.slider = this.root.append('div')
        .attr('class', 'form-group col-md-6')
        .style('margin-top', '1%')
        .append('input')
        .attr('type', 'range')
        .attr('name', 'rangeInput')
        .attr('step', 1)
        .attr('min', this.min)
        .attr('max', this.max);
      this.slider.property('value', this.min);

      this.nextButton = this.root.append('div')
        .attr('class', 'btn btn-default ACNext col-md-2')
        .text('Next');

      //Bind Event Listeners
      this.prevButton.on('click', () => {
        let value = parseInt(this.slider.property('value'));
        value = (value - 1 < 0) ? value : value - 1;
        this.slider.property('value', value);
        this.renderer(value);
      });
      this.slider.on('change input', () => {
        let value = parseInt(this.slider.property('value'));
        this.renderer(value);
      });
      this.nextButton.on('click', () => {
        let value = parseInt(this.slider.property('value'));
        value = (value + 1 > this.max) ? value : value + 1;
        this.slider.property('value', value);
        this.renderer(value);
      });
    }
    /**
     * Renders the first frame
     */
  renderFirst() {
    this.renderer(this.min);
  }
}
