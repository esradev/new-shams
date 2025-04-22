import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/TabBar'
import Header from '@/components/header'

const _layout = () => {
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'خانه',
          header: () => <Header />
        }}
      />
      <Tabs.Screen
        name='courses'
        options={{
          title: 'دروس',
          header: () => <Header />
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'جستجو',
          header: () => <Header />
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'تنظیمات',
          header: () => <Header />
        }}
      />
    </Tabs>
  )
}

export default _layout
