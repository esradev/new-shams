import { Text, TouchableOpacity, View } from 'react-native'

const Pagination = ({
  page,
  setPage,
  totalPages
}: {
  page: number
  setPage: (page: number) => void
  totalPages: number
}) => {
  const links = []
  const ellipsis = (
    <Text className='relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0'>
      ...
    </Text>
  )

  // Always show first page
  if (page !== 1) {
    links.push(
      <TouchableOpacity
        key={1}
        className='rounded-sm'
        onPress={() => setPage(1)}>
        <Text
          className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold ${
            page === 1
              ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
          }`}>
          1
        </Text>
      </TouchableOpacity>
    )
  }

  // Add ellipsis if current page is beyond page 3
  if (page > 4) {
    links.push(ellipsis)
  }

  // Show the 2 pages before the current page (if applicable)
  if (page > 2) {
    links.push(
      <TouchableOpacity
        key={page - 1}
        className='rounded-sm'
        onPress={() => setPage(page - 1)}>
        <Text
          className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold ${
            page === page - 1
              ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              : ' text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
          }`}>
          {page - 1}
        </Text>
      </TouchableOpacity>
    )
  }

  // Show the current page
  links.push(
    <TouchableOpacity
      key={page}
      className='rounded-sm'
      onPress={() => setPage(page)}>
      <Text className='relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 bg-indigo-600 text-white'>
        {page}
      </Text>
    </TouchableOpacity>
  )

  // Show the 2 pages after the current page (if applicable)
  if (page < totalPages - 1) {
    links.push(
      <TouchableOpacity
        key={page + 1}
        className='rounded-sm'
        onPress={() => setPage(page + 1)}>
        <Text
          className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold ${
            page === page + 1
              ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
          }`}>
          {page + 1}
        </Text>
      </TouchableOpacity>
    )
  }

  // Add ellipsis if current page is more than 3 pages away from the last page
  if (page < totalPages - 2) {
    links.push(ellipsis)
  }

  // Always show last page
  if (page !== totalPages) {
    links.push(
      <TouchableOpacity
        key={totalPages}
        className='rounded-sm'
        onPress={() => setPage(totalPages)}>
        <Text
          className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold ${
            page === totalPages
              ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
          }`}>
          {totalPages}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View className='isolate inline-flex rounded-md shadow-sm flex-row border border-gray-300 mb-6 divide-gray-300 divide-x'>
      {links}
    </View>
  )
}

export default Pagination
