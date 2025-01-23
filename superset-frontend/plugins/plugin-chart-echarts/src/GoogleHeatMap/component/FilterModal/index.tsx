import { memo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Form, Modal, Select } from 'antd-v5';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FilterOutlined } from '@ant-design/icons';
// @ts-ignore
import styles from '../../style/index.module.less';
import { useModal } from '../../hooks/modal';
import { useFilterSelect } from '../../hooks/filterSelect';

/* eslint-disable */



export default memo(function FilterModal(
  props: any,
) {

  console.log(props, 'modal-重复渲染了');


  const { isModalOpen, showModal, handleOk, handleCancel } = useModal();

  const {
    platformsSelect,
    skusSelect,
    yearsSelect,
    platformsVal,
    setPlatformsVal,
    skusVal,
    setSkusVal,
    yearsVal,
    setYearsVal,
  } = useFilterSelect();

  const closeAndUpdateMap = () => {
    handleOk();
    const queryData = {
      selectedYears: yearsVal,
      selectedPlatforms: platformsVal,
      selectedSkus: skusVal,
    };
    const {idleLoadData} = props;
    idleLoadData(queryData, 10);
    console.log('queryData', queryData);
  };

  return (
    <>
      <FilterOutlined
        className={`clickable ${styles.clickable}`}
        onClick={showModal}
      />
      <Modal
        className={`ant-model-update ${styles['ant-model-update']}`}
        title="筛选"
        open={isModalOpen}
        onOk={closeAndUpdateMap}
        onCancel={handleCancel}
        cancelText="取消"
        okText="确定"
      >
        <Form
          name="wrap"
          labelCol={{ flex: '50px' }}
          labelAlign="left"
          labelWrap
          wrapperCol={{ flex: 1 }}
          colon={false}
        >
          <Form.Item label="年份">
            <Select
              mode="multiple"
              className={`select ${styles.select}`}
              value={yearsVal}
              onChange={setYearsVal}
            >
              {yearsSelect.map((item: any) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item label="平台">
            <Select
              mode="multiple"
              className={`select ${styles.select}`}
              value={platformsVal}
              onChange={setPlatformsVal}
            >
              {platformsSelect.map((item: any) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item label="sku">
            <Select
              mode="multiple"
              className={`select ${styles.select}`}
              value={skusVal}
              onChange={setSkusVal}
            >
              {skusSelect.map((item: any) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
