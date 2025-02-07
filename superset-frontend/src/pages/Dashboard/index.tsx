/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPage } from 'src/dashboard/containers/DashboardPage';

const hiddenHeaders = () => {
  const hiddenFlag = window.location.search.indexOf('hiddenDashboards') !== -1;
  if (hiddenFlag) {
    const dom: any = document.querySelector('header#main-menu');
    const container: any = document.querySelector(
      '.dashboard-header-container',
    );
    if (dom) {
      dom.style.display = 'none';
    }
    if(container) {
      container.style.display = 'none';
    }
    console.log('隐藏表头', dom);
  }
  console.log('进入dashBoard了');
};

const DashboardRoute: FC = () => {
  hiddenHeaders();
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  return <DashboardPage idOrSlug={idOrSlug} />;
};

export default DashboardRoute;
