from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10                    # default page size
    page_size_query_param = "page_size"  # allow clients to set ?page_size=xx
    max_page_size = 100               # cap to avoid abuse