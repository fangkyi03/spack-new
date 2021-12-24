<script>
export default {
  data() {
    return {
      inputValue: "",
    };
  },
  methods: {
    renderInput() {
      return <input value={this.inputValue} />;
    },
  },
  render(h) {
    return (
      <div>
        <van-button>测试</van-button>
      </div>
    );
  },
};
</script>
