<script setup>
let count = 1;
const props = { label: 'name', children: 'zones' };

const handleCheckChange = (data, checked, indeterminate) => {
  console.log(data, checked, indeterminate);
};

const loadNode = (node, resolve) => {
  if (node.level === 0) {
    return resolve([{ name: 'Root1' }, { name: 'Root2' }]);
  }

  if (node.level > 3) return resolve([]);
  let hasChild = false;

  if (node.data.name === 'region1') {
    hasChild = true;
  } else if (node.data.name === 'region2') {
    hasChild = false;
  } else {
    hasChild = Math.random() > 0.5;
  }

  setTimeout(() => {
    let data = [];
    if (hasChild) {
      data = [{ name: `zone${count++}` }, { name: `zone${count++}` }];
    } else {
      data = [];
    }
    resolve(data);
  }, 500);
};
</script>

<template>
  <el-tree
    :props="props"
    :load="loadNode"
    lazy
    show-checkbox
    @check-change="handleCheckChange"
  />
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  font-size: 14px;
}
.item {
  margin-bottom: 18px;
}
.box-card {
  margin: 24px;
  width: 480px;
}
</style>
