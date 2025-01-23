import { memo, forwardRef } from 'react';

// eslint-disable-next-line arrow-body-style
const GoogleMap = forwardRef((props, ref: any) => {
  return (
    <div
      id="map"
      ref={ref}
      style={{ width: '100%', height: '100%' }}
      // style={{ width: '100%', height: 'calc(100vh - 40px)' }}
    />
  );
});

export default memo(GoogleMap);
